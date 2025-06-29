"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "./ControlPanel";
import Canvas from "./Canvas";
import ControlButtons from "./ControlButtons";
import GraphMgr from "@/src/GraphMgr";
import { fragmentShader } from "../Shaders/FragmentShader";
import { Vector2 } from "three";
import { latexToGLSL } from "@/src/Parser/latexToGLSL";

export default function Main() {
  const [shader, setShader] = useState(fragmentShader);
  const [graph, setGraph] = useState<GraphMgr>(new GraphMgr());
  const [renderMode, setRenderMode] = useState(0);

  // LaTeX文字列を管理
  const [currentFunctionLatex, setCurrentFunctionLatex] =
    useState<string>("x^2+y^2-1");

  // エラー状態
  const [error, setError] = useState<string | null>(null);

  const [hasLoadedFromParams, setHasLoadedFromParams] = useState(false);

  const searchParams = useSearchParams();

  // LaTeX文字列からGLSLコードを生成
  const convertLatexToGLSL = useCallback((functionLatex: string) => {
    try {
      const functionCode = latexToGLSL(functionLatex, undefined, [
        "x",
        "y",
        "t",
      ]);
      setError(null);
      return { functionCode };
    } catch (error) {
      setError(String(error));
      return null;
    }
  }, []);

  // LaTeX文字列が変更された時にGLSLコードを更新
  useEffect(() => {
    const result = convertLatexToGLSL(currentFunctionLatex);
    if (!result) return;
    setShader(() => {
      let newShader = fragmentShader;

      // 関数コードの更新
      if (result.functionCode) {
        newShader = newShader.replace(
          /\/\* input func here \*\//,
          `c = ${result.functionCode};`
        );
      }

      return newShader;
    });
  }, [currentFunctionLatex, convertLatexToGLSL]);

  // クエリパラメータから状態を読み込む（初回のみ）
  useEffect(() => {
    if (searchParams && !hasLoadedFromParams) {
      let hasUpdates = false;

      // 関数の読み込み (LaTeX文字列)
      const functionLatex = searchParams.get("function");
      if (functionLatex !== null) {
        const decodedFunctionLatex = decodeURIComponent(functionLatex);
        setCurrentFunctionLatex(decodedFunctionLatex);
        hasUpdates = true;
      }

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

      // レンダリングモードの読み込み
      const renderModeParam = searchParams.get("renderMode");
      if (renderModeParam !== null) {
        setRenderMode(+renderModeParam);
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

      if (currentFunctionLatex !== "z^2+c") {
        params.set("function", encodeURIComponent(currentFunctionLatex));
      }

      if (graph.origin.x !== 0 || graph.origin.y !== 0) {
        params.set("origin", `${graph.origin.x},${graph.origin.y}`);
      }

      if (graph.radius !== 2) {
        params.set("radius", graph.radius.toString());
      }

      if (renderMode !== 0) {
        params.set("renderMode", renderMode.toString());
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
  }, [currentFunctionLatex, graph, renderMode]);

  return (
    <main className="relative">
      <Canvas
        shader={shader}
        graph={graph}
        onGraphChange={setGraph}
        renderMode={renderMode}
      />
      <ControlPanel
        onFunctionLatexChange={setCurrentFunctionLatex}
        currentFunctionLatex={currentFunctionLatex}
        error={error}
      />
      <ControlButtons
        onResetGraph={handleResetGraph}
        onRenderModeChange={setRenderMode}
        currentRenderMode={renderMode}
        onShareLink={handleShareLink}
      />
    </main>
  );
}
