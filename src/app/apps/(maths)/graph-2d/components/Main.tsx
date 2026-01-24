"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Vector2 } from "three";
import GraphMgr from "@/src/GraphMgr";
import {
  type FunctionDef,
  parseFunctionDef,
  parseInequality,
} from "@/src/Parser/graph2d/expressionParser";
import { latexToGLSL } from "@/src/Parser/latexToGLSL";
import { fragmentShader } from "../Shaders/FragmentShader";
import Canvas from "./Canvas";
import ControlButtons from "./ControlButtons";
import ControlPanel from "./ControlPanel";

// 組み込み関数リスト
const BUILTIN_FUNCS = [
  "sin",
  "cos",
  "tan",
  "cot",
  "sec",
  "csc",
  "arcsin",
  "arccos",
  "arctan",
  "arccot",
  "arcsec",
  "arccsc",
  "exp",
  "sinh",
  "cosh",
  "tanh",
  "coth",
  "sech",
  "csch",
  "arsinh",
  "arcosh",
  "artanh",
  "arcoth",
  "arsech",
  "arcsch",
  "abs",
  "ln",
  "max",
  "min",
];

/**
 * 関数定義からGLSL関数を生成
 */
function generateGLSLFunction(def: FunctionDef, knownFuncs: string[]): string {
  try {
    const bodyGLSL = latexToGLSL(
      def.body,
      [...BUILTIN_FUNCS, ...knownFuncs],
      [...def.args, "t"],
    );
    const params = def.args.map((a) => `float ${a}`).join(", ");
    return `float ${def.name}(${params}) { return ${bodyGLSL}; }`;
  } catch (e) {
    console.error(`Failed to generate GLSL function for ${def.name}:`, e);
    return `float ${def.name}(${def.args.map((a) => `float ${a}`).join(", ")}) { return 0.0; }`;
  }
}

export default function Main() {
  const [shader, setShader] = useState(fragmentShader);
  const [graph, setGraph] = useState<GraphMgr>(new GraphMgr());
  const [renderMode, setRenderMode] = useState(0);

  // LaTeX文字列を管理（複数式対応：改行区切り）
  const [currentExpressions, setCurrentExpressions] = useState<string[]>([
    "1>x^2+y^2",
  ]);

  // エラー状態
  const [error, setError] = useState<string | null>(null);

  const [hasLoadedFromParams, setHasLoadedFromParams] = useState(false);

  const searchParams = useSearchParams();

  // 式リストからシェーダーを生成
  const generateShaderFromExpressions = useCallback(
    (expressions: string[]): string | null => {
      try {
        const functionDefs: FunctionDef[] = [];
        let inequalityLeft = "";
        let inequalityRight = "";
        let isLessThan = true;

        // 式を解析
        for (const expr of expressions) {
          const trimmed = expr.trim();
          if (!trimmed) continue;

          const funcDef = parseFunctionDef(trimmed);
          if (funcDef) {
            functionDefs.push(funcDef);
          } else {
            // 不等式として扱う
            const inequality = parseInequality(trimmed);
            console.log("[parse] input:", trimmed, "→", inequality);
            if (inequality) {
              inequalityLeft = inequality.left;
              inequalityRight = inequality.right;
              isLessThan = inequality.isLessThan;
            } else {
              // 不等号がない場合はエラー
              throw new Error(
                `Inequality required (e.g. 0<${trimmed} or 0>${trimmed})`,
              );
            }
          }
        }

        if (!inequalityLeft && !inequalityRight) {
          setError("Inequality required");
          return null;
        }

        // ユーザー定義関数名を収集
        const userFuncNames = functionDefs.map((def) => def.name);

        // GLSL関数を生成
        const glslFunctions = functionDefs.map((def, idx) => {
          const knownFuncs = functionDefs.slice(0, idx).map((d) => d.name);
          return generateGLSLFunction(def, knownFuncs);
        });

        // 左辺と右辺を別々にGLSLに変換
        const knownFuncs = [...BUILTIN_FUNCS, ...userFuncNames];
        const knownVars = ["x", "y", "t"];
        console.log("[parse] left:", inequalityLeft, "right:", inequalityRight, "isLessThan:", isLessThan);
        const leftGLSL = latexToGLSL(inequalityLeft, knownFuncs, knownVars);
        const rightGLSL = latexToGLSL(inequalityRight, knownFuncs, knownVars);
        // GLSLレベルで引き算
        const mainGLSL = `(${leftGLSL}) - (${rightGLSL})`;
        console.log("[parse] mainGLSL:", mainGLSL);

        // シェーダーを構築
        let newShader = fragmentShader;

        // ユーザー定義関数を挿入（graph2d関数の前に）
        if (glslFunctions.length > 0) {
          const funcInsertPoint = "float graph2d(vec2 C) {";
          const funcCode = glslFunctions.join("\n\n") + "\n\n";
          newShader = newShader.replace(
            funcInsertPoint,
            funcCode + funcInsertPoint,
          );
        }

        // メイン式を挿入
        newShader = newShader.replace(
          /\/\* input func here \*\//,
          `c = ${mainGLSL};`,
        );

        // 不等号に応じて塗りつぶし判定を調整
        if (!isLessThan) {
          newShader = newShader.replace(
            /c < 0\. \? 1\. : 0\./,
            "c > 0. ? 1. : 0.",
          );
        }

        setError(null);
        return newShader;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(errorMessage);
        return null;
      }
    },
    [],
  );

  // 式が変更された時にシェーダーを更新
  useEffect(() => {
    const newShader = generateShaderFromExpressions(currentExpressions);
    if (newShader) {
      setShader(newShader);
    }
  }, [currentExpressions, generateShaderFromExpressions]);

  // クエリパラメータから状態を読み込む（初回のみ）
  useEffect(() => {
    if (searchParams && !hasLoadedFromParams) {
      // 式の読み込み (LaTeX文字列、セミコロン区切りで複数式)
      const exprParam = searchParams.get("expr");
      if (exprParam !== null) {
        const decodedExpr = decodeURIComponent(exprParam);
        // セミコロン区切りで複数式をサポート
        const expressions = decodedExpr.split(";").map((e) => e.trim());
        setCurrentExpressions(expressions);
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
      }

      // レンダリングモードの読み込み
      const renderModeParam = searchParams.get("renderMode");
      if (renderModeParam !== null) {
        setRenderMode(+renderModeParam);
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

      // 複数式をセミコロン区切りで保存
      const expressionsStr = currentExpressions.join(";");
      if (expressionsStr !== "1>x^2+y^2") {
        params.set("expr", encodeURIComponent(expressionsStr));
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
  }, [currentExpressions, graph, renderMode]);

  return (
    <main className="relative w-screen h-[calc(100vh-var(--header-height))] overflow-hidden">
      <Canvas
        shader={shader}
        graph={graph}
        onGraphChange={setGraph}
        renderMode={renderMode}
      />
      <ControlPanel
        onExpressionsChange={setCurrentExpressions}
        currentExpressions={currentExpressions}
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
