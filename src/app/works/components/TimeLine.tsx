"use client";
import React, { useCallback, useEffect, useState } from "react";
import Post from "./Post";
import useSWRInfinite from "swr/infinite";
import axios from "axios";
import { IPost } from "@/types/IPost";
import Core from "@/app/apps/maths/compdynam/Core";
import { useIsClient } from "@/components/IsClientCtx";

export default function TimeLine() {
  const isClient = useIsClient();
  const getKey = (pageIndex: number, previousPageData: IPost[][]) => {
    if (previousPageData && !previousPageData.length) return null; // 最後に到達した
    return `/api/works/get?page=${pageIndex}&take=10`; // SWR キー
  };

  const fetcher = useCallback(
    async (url: string) => (await axios.get<IPost[]>(url)).data,
    []
  );
  const { data, size, setSize, error, isLoading } = useSWRInfinite(
    getKey,
    fetcher,
    {
      parallel: true,
      revalidateIfStale: false, // キャッシュがあっても再検証
      revalidateOnFocus: false, // windowをフォーカスすると再検証
      revalidateFirstPage: false, // 2ページ目以降を読み込むとき毎回1ページ目を再検証
    }
  );
  /*
    ページが最後に到達したかをisReachingEndで定義
  */
  const limit = 10; // 1ページあたり表示数
  const isEmpty = data?.[0]?.length === 0; // 1ページ目のデータが空
  const isReachingEnd =
    isEmpty || (data && data?.[data?.length - 1]?.length < limit); // 1ページ目のデータが空 or データの最後のデータが1ページあたりの表示数より少ない

  // const [inputData, setInputData] = useState<(IPost & { src: string })[]>([]);
  const [core, setCore] = useState<Core>();

  useEffect(() => {
    if (!core && isClient) {
      const initCore = new Core();
      (async () => {
        initCore.controls = false;
        // core.lowFPS = true;

        await initCore.init(false);
        // setInputData(
        //   data.flat().map((d) => {
        //     core.iter = d.iteration;
        //     core.graph.origin.x = d.originX;
        //     core.graph.origin.y = d.originY;
        //     core.graph.radius = d.radius;
        //     core.z0expr = d.z0Expression;
        //     core.funcexpr = d.expression;
        //     core.loop();
        //     const src = core.export();
        //     return { ...d, src };
        //   })
        // );
        setCore(initCore);
      })();
    }
  }, [data, core]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts</div>;
  console.log(data);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        // filter: "grayscale(1)",
      }}
    >
      {data &&
        core &&
        data.flat().map((d) => {
          core.iter = d.iteration;
          core.graph.origin.x = d.originX;
          core.graph.origin.y = d.originY;
          core.graph.radius = d.radius;
          core.z0expr = d.z0Expression;
          core.funcexpr = d.expression;
          core.loop();
          const src = core.export();
          return <Post key={d.id} data={{ ...d, src }} />;
        })}
      {!isReachingEnd && (
        <button
          style={{
            width: 200,
            height: 200,
            margin: 5,
            border: "1px solid white",
            borderRadius: 10,
            overflow: "hidden",
          }}
          onClick={() => {
            setSize(size + 1);
          }}
        >
          もっと読み込む
        </button>
      )}
    </div>
  );
}
