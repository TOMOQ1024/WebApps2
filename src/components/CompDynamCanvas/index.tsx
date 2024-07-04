"use client";

import { useEffect, useState } from "react";
import Core from "./Core";
import { IPost } from "@/types/IPost";

export default function CompDynamCanvas({
  options,
}: {
  options?: {
    width?: number;
    height?: number;
    data?: IPost;
  };
}) {
  const [core, setCore] = useState(new Core());
  useEffect(() => {
    if (!core.rawShaderData.frag) {
      (async () => {
        if (options?.data) {
          const data = options.data;
          core.controls = false;
          core.lowFPS = true;
          await core.init(
            document.querySelector(`#cdcvs-${data.id}`) as HTMLElement
          );
          core.iter = data.iteration;
          core.graph.origin.x = data.originX;
          core.graph.origin.y = data.originY;
          core.graph.radius = data.radius;
          core.z0expr = data.z0Expression;
          core.funcexpr = data.expression;
        }
      })();
    }
    return () => {
      core.endLoop();
    };
  }, [core, options]);
  return (
    <div
      id={`cdcvs-${options?.data?.id}`}
      style={{
        display: "inline-block",
        width: options?.width,
        height: options?.height,
      }}
    ></div>
  );
}
