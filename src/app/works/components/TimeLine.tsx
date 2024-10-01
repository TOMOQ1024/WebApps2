"use client";

import React, { useEffect, useState } from "react";
import Post from "./Post";
import useSWR from "swr";
import axios from "axios";
import { IPost } from "@/types/IPost";
import Core from "@/app/apps/maths/compdynam/Core";

async function fetcher() {
  return (await axios.get("/api/works/get")).data;
}

export default function TimeLine() {
  const { data, error, isLoading } = useSWR<IPost[]>("/api/user", fetcher);
  const [inputData, setInputData] = useState<(IPost & { src: string })[]>([]);

  if (typeof document !== "undefined") {
    const cvs = document.createElement("canvas") as HTMLCanvasElement;
    cvs.width = 200;
    cvs.height = 200;
    const [core, setCore] = useState(new Core(cvs));

    useEffect(() => {
      if (!core.rawShaderData.frag) {
        if (data) {
          (async () => {
            core.controls = false;
            // core.lowFPS = true;

            await core.init(false);
            setInputData(
              await Promise.all(
                data.map(async (d) => {
                  core.iter = d.iteration;
                  core.graph.origin.x = d.originX;
                  core.graph.origin.y = d.originY;
                  core.graph.radius = d.radius;
                  core.z0expr = d.z0Expression;
                  core.funcexpr = d.expression;
                  core.loop();
                  const src = core.export();
                  return { ...d, src };
                })
              )
            );
          })();
        }
      }
    }, [data, core]);
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts</div>;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        filter: "grayscale(1)",
      }}
    >
      {inputData.map((d) => (
        <Post key={d.id} data={d} />
      ))}
    </div>
  );
}
