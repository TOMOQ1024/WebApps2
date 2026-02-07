"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Vector2 } from "three";
import { useAuth } from "@/components/SupabaseAuthProvider";
import GraphMgr from "@/src/GraphMgr";
import {
  type ChainedInequalityResult,
  type ConstantDef,
  type FunctionDef,
  isNumericExpression,
  parseChainedInequality,
  parseConstantDef,
  parseFunctionDef,
} from "@/src/Parser/graph2d/expressionParser";
import { latexToGLSL } from "@/src/Parser/latexToGLSL";
import { fragmentShader } from "../Shaders/FragmentShader";
import Canvas, { type CanvasHandle } from "./Canvas";
import ControlButtons from "./ControlButtons";
import ControlPanel from "./ControlPanel";
import PostModal from "./PostModal";

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
  "floor",
  "ceil",
  "round",
  "fract",
  "sign",
  "sgn",
  "mod",
];

/**
 * 連鎖不等式をGLSLに変換
 * a < b < c → max((a)-(b), (b)-(c))
 * a > b > c → max((b)-(a), (c)-(b))
 * 混在の場合も各ペアごとに符号を調整
 */
function chainedInequalityToGLSL(
  result: ChainedInequalityResult,
  knownFuncs: string[],
  knownVars: string[],
): string {
  const { parts, operators } = result;
  const partsGLSL = parts.map((part) =>
    latexToGLSL(part, knownFuncs, knownVars),
  );

  // 各隣接ペアの差を計算
  const diffs: string[] = [];
  for (let i = 0; i < operators.length; i++) {
    const left = partsGLSL[i];
    const right = partsGLSL[i + 1];
    if (operators[i] === "<") {
      // a < b → (a) - (b) < 0
      diffs.push(`(${left}) - (${right})`);
    } else {
      // a > b → (b) - (a) < 0
      diffs.push(`(${right}) - (${left})`);
    }
  }

  // すべての差の max を取る（すべてが負なら条件成立）
  if (diffs.length === 1) {
    return diffs[0];
  }
  // max(a, max(b, max(c, d))) の形式で結合
  return diffs.reduceRight((acc, diff) => `max(${diff}, ${acc})`);
}

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
  const { user } = useAuth();
  const [shader, setShader] = useState(fragmentShader);
  const [graph, setGraph] = useState<GraphMgr>(new GraphMgr());
  const [renderMode, setRenderMode] = useState(0);
  const [exprType, setExprType] = useState(0); // 0: 不等式, 1: 数値式

  // LaTeX文字列を管理（複数式対応：改行区切り）
  const [currentExpressions, setCurrentExpressions] = useState<string[]>([
    "1>x^2+y^2",
  ]);

  // エラー状態
  const [error, setError] = useState<string | null>(null);

  const [hasLoadedFromParams, setHasLoadedFromParams] = useState(false);

  // 投稿モーダルの状態
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);

  // Canvas への参照
  const canvasRef = useRef<CanvasHandle>(null);

  // クエリパラメータから読み込んだ初期グラフ設定を保持
  const initialGraphRef = useRef<GraphMgr>(new GraphMgr());

  const searchParams = useSearchParams();

  // 式リストからシェーダーを生成
  const generateShaderFromExpressions = useCallback(
    (expressions: string[]): { shader: string; exprType: number } | null => {
      try {
        const functionDefs: FunctionDef[] = [];
        const constantDefs: ConstantDef[] = [];
        let mainExpression: string | null = null;
        let chainedInequality: ChainedInequalityResult | null = null;
        let isNumeric = false;

        // 式を解析
        for (const expr of expressions) {
          const trimmed = expr.trim();
          if (!trimmed) continue;

          const funcDef = parseFunctionDef(trimmed);
          if (funcDef) {
            functionDefs.push(funcDef);
            continue;
          }

          const constDef = parseConstantDef(trimmed);
          if (constDef) {
            constantDefs.push(constDef);
            continue;
          }

          // メイン式として扱う（最後の非関数/非定数定義式）
          mainExpression = trimmed;
        }

        if (!mainExpression) {
          setError("Expression required");
          return null;
        }

        // メイン式の種類を判定
        if (isNumericExpression(mainExpression)) {
          // 数値式（グレースケール表示）
          isNumeric = true;
        } else {
          // 不等式（連鎖不等式を含む）
          chainedInequality = parseChainedInequality(mainExpression);
          if (!chainedInequality) {
            throw new Error("Failed to parse inequality");
          }
        }

        // ユーザー定義関数名を収集（重複チェック）
        const userFuncNames = functionDefs.map((def) => def.name);
        const userConstNames = constantDefs.map((def) => def.name);
        const allUserNames = [...userFuncNames, ...userConstNames];
        const duplicateNames = allUserNames.filter(
          (name, index) => allUserNames.indexOf(name) !== index,
        );
        if (duplicateNames.length > 0) {
          throw new Error(`Duplicate definition: ${duplicateNames[0]}`);
        }

        // 予約変数との重複チェック
        const reservedVars = ["x", "y", "t"];
        for (const name of allUserNames) {
          if (reservedVars.includes(name)) {
            throw new Error(`Cannot redefine reserved variable: ${name}`);
          }
        }

        // GLSL関数を生成
        const glslFunctions = functionDefs.map((def, idx) => {
          const knownFuncs = functionDefs.slice(0, idx).map((d) => d.name);
          return generateGLSLFunction(def, knownFuncs);
        });

        const knownFuncs = [...BUILTIN_FUNCS, ...userFuncNames];
        const knownVars = ["x", "y", "t", ...userConstNames];

        // GLSL定数を生成
        const glslConstants = constantDefs.map((def, idx) => {
          // 前の定数は既知として扱う
          const prevConstNames = constantDefs.slice(0, idx).map((d) => d.name);
          const constKnownVars = ["x", "y", "t", ...prevConstNames];
          const valueGLSL = latexToGLSL(def.value, knownFuncs, constKnownVars);
          return `float ${def.name} = ${valueGLSL};`;
        });

        let mainGLSL: string;
        if (isNumeric) {
          // 数値式をそのままGLSLに変換
          mainGLSL = latexToGLSL(mainExpression, knownFuncs, knownVars);
        } else if (chainedInequality) {
          // 連鎖不等式をGLSLに変換
          mainGLSL = chainedInequalityToGLSL(
            chainedInequality,
            knownFuncs,
            knownVars,
          );
        } else {
          throw new Error("Invalid expression");
        }

        // シェーダーを構築
        let newShader = fragmentShader;

        // ユーザー定義関数を挿入（graph2d関数の前に）
        if (glslFunctions.length > 0) {
          const funcInsertPoint = "float graph2d(vec2 _C) {";
          const funcCode = `${glslFunctions.join("\n\n")}\n\n`;
          newShader = newShader.replace(
            funcInsertPoint,
            funcCode + funcInsertPoint,
          );
        }

        // 定数とメイン式を挿入
        const constantsCode =
          glslConstants.length > 0 ? `${glslConstants.join("\n  ")}\n\n  ` : "";
        newShader = newShader.replace(
          /\/\* input func here \*\//,
          `${constantsCode}c = ${mainGLSL};`,
        );

        setError(null);
        return { shader: newShader, exprType: isNumeric ? 1 : 0 };
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
    const result = generateShaderFromExpressions(currentExpressions);
    if (result) {
      setShader(result.shader);
      setExprType(result.exprType);
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

      let newOrigin = new Vector2(0, 0);
      let newRadius = 2;

      if (origin !== null) {
        const coords = origin.split(",").map((a) => +a);
        if (coords.length === 2) {
          newOrigin = new Vector2(coords[0], coords[1]);
        }
      }

      if (radius !== null) {
        newRadius = +radius;
      }

      // 初期グラフ設定を保存（リセット時に使用）
      // 注意: refと状態は別のインスタンスにする（GraphMgrはmutableなため）
      initialGraphRef.current = new GraphMgr(newOrigin.clone(), newRadius);

      if (origin !== null || radius !== null) {
        setGraph(new GraphMgr(newOrigin, newRadius));
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
    // クエリパラメータから読み込んだ初期設定にリセット
    const initial = initialGraphRef.current;
    setGraph(new GraphMgr(initial.origin.clone(), initial.radius));
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

  const handleExportGalleryData = useCallback(async () => {
    try {
      // GalleryData 形式の JSON を生成
      const galleryItem = {
        expressions: currentExpressions.filter((e) => e.trim() !== ""),
        center: [graph.origin.x, graph.origin.y] as [number, number],
        radius: graph.radius,
      };

      const jsonStr = JSON.stringify(galleryItem, null, 2);

      // クリップボードにコピー
      await navigator.clipboard.writeText(jsonStr);

      console.log("ギャラリーデータをクリップボードにコピーしました:", jsonStr);
    } catch (error) {
      console.error("クリップボードへのコピーに失敗しました:", error);
    }
  }, [currentExpressions, graph]);

  // ギャラリーデータを生成
  const getGalleryData = useCallback(() => {
    return {
      expressions: currentExpressions.filter((e) => e.trim() !== ""),
      center: [graph.origin.x, graph.origin.y] as [number, number],
      radius: graph.radius,
    };
  }, [currentExpressions, graph]);

  const handleOpenPostModal = useCallback(() => {
    // キャンバスをキャプチャしてサムネイルを生成
    const thumbnail = canvasRef.current?.captureSquareThumbnail(256);
    setThumbnailDataUrl(thumbnail || null);
    setIsPostModalOpen(true);
  }, []);

  const handleClosePostModal = useCallback(() => {
    setIsPostModalOpen(false);
  }, []);

  // PostModal からの描画設定変更を処理
  const handleGalleryDataChange = useCallback(
    (data: { center?: [number, number]; radius?: number }) => {
      if (data.center !== undefined) {
        const newCenter = data.center;
        setGraph(
          (prev) =>
            new GraphMgr(new Vector2(newCenter[0], newCenter[1]), prev.radius),
        );
      }
      if (data.radius !== undefined) {
        const newRadius = data.radius;
        setGraph((prev) => new GraphMgr(prev.origin.clone(), newRadius));
      }
    },
    [],
  );

  // モーダルが開いている間，graph が変更されたらサムネイルを再キャプチャ
  // biome-ignore lint/correctness/useExhaustiveDependencies: graph の変更をトリガーとして使用
  useEffect(() => {
    if (isPostModalOpen) {
      // Canvas が再描画されるまで少し待つ
      const timeoutId = setTimeout(() => {
        const thumbnail = canvasRef.current?.captureSquareThumbnail(256);
        setThumbnailDataUrl(thumbnail || null);
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isPostModalOpen, graph]);

  return (
    <main className="relative w-screen h-[calc(100vh-var(--header-height))] overflow-hidden">
      <Canvas
        ref={canvasRef}
        shader={shader}
        graph={graph}
        onGraphChange={setGraph}
        renderMode={renderMode}
        exprType={exprType}
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
        onExportGalleryData={handleExportGalleryData}
        onPost={handleOpenPostModal}
        isLoggedIn={!!user}
        exprType={exprType}
      />
      <PostModal
        isOpen={isPostModalOpen}
        onClose={handleClosePostModal}
        galleryData={getGalleryData()}
        onGalleryDataChange={handleGalleryDataChange}
        thumbnailDataUrl={thumbnailDataUrl ?? undefined}
      />
    </main>
  );
}
