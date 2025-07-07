import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "./ControlPanel";
import Canvas from "./Canvas";
import ControlButtons from "./ControlButtons";
import GraphMgr from "@/src/GraphMgr";
import { fragmentShader } from "../Shaders/FragmentShader";
import { Vector2 } from "three";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";

export default function Main() {
  const [shader, setShader] = useState(fragmentShader);
  const [graph, setGraph] = useState<GraphMgr>(new GraphMgr());
  const [diagram, setDiagram] = useState<CoxeterDynkinDiagram>(
    new CoxeterDynkinDiagram(
      {
        ab: [2, 1],
        ba: [2, 1],
        bc: [3, 1],
        cb: [3, 1],
        ac: [2, 1],
        ca: [2, 1],
      },
      {
        a: "x",
        b: "x",
        c: "x",
      }
    )
  );

  // エラー状態
  const [error, setError] = useState<string | null>(null);

  const [hasLoadedFromParams, setHasLoadedFromParams] = useState(false);

  const searchParams = useSearchParams();

  // クエリパラメータから状態を読み込む（初回のみ）
  useEffect(() => {
    if (searchParams && !hasLoadedFromParams) {
      let hasUpdates = false;

      // 描画範囲の読み込み
      const origin = searchParams.get("origin");
      const radius = searchParams.get("radius");

      if (origin !== null || radius !== null) {
        setGraph((prev) => {
          let newOrigin = prev.origin;
          let newRadius = prev.radius;

          if (origin !== null) {
            const coords = origin.split(",").map((a) => +a);
            if (coords.length === 2) {
              newOrigin = new Vector2(coords[0], coords[1]);
            }
          }

          if (radius !== null) {
            newRadius = +radius;
          }

          return new GraphMgr(newOrigin, newRadius);
        });
        hasUpdates = true;
      }

      // 読み込み完了をマーク
      setHasLoadedFromParams(true);
    }
  }, [searchParams, hasLoadedFromParams]);

  const handleResetGraph = () => {
    setGraph(new GraphMgr());
  };

  const handleShareLink = useCallback(async () => {
    try {
      // 現在の状態からクエリパラメータを生成
      const params = new URLSearchParams();

      if (graph.origin.x !== 0 || graph.origin.y !== 0) {
        params.set("origin", `${graph.origin.x},${graph.origin.y}`);
      }

      if (graph.radius !== 2) {
        params.set("radius", graph.radius.toString());
      }

      // 完全なURLを生成
      const baseUrl = window.location.origin + window.location.pathname;
      const queryString = params.toString();
      const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      // URL を更新
      window.history.replaceState({}, "", fullUrl);

      // クリップボードにコピー
      await navigator.clipboard.writeText(fullUrl);

      // 成功メッセージを表示（オプション）
      console.log("リンクをクリップボードにコピーしました:", fullUrl);
    } catch (error) {
      console.error("クリップボードへのコピーに失敗しました:", error);
    }
  }, [graph]);

  return (
    <main className="relative">
      <Canvas shader={shader} graph={graph} onGraphChange={setGraph} />
      <ControlPanel
        diagram={diagram}
        onDiagramChange={setDiagram}
        error={error}
        buildTime={0}
        onBuild={() => Promise.resolve()}
      />
      <ControlButtons
        onResetGraph={handleResetGraph}
        onShareLink={handleShareLink}
      />
    </main>
  );
}
