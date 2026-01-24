"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ASTToJS } from "@/src/Parser/ASTToJS";
import { parseLatex } from "@/src/Parser/parseLatex";
import type { ExpressionMode, Graph3DCore } from "../core/Graph3DCore";
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
  "sqrt",
  "max",
  "min",
  "floor",
  "ceil",
  "round",
  "sign",
];

/**
 * z= で始まるかチェック
 */
function startsWithZEquals(expression: string): boolean {
  return /^z\s*=/.test(expression);
}

/**
 * z を変数として含むかチェック（関数名の一部ではなく独立した変数として）
 * = の後ろの z も含める
 */
function containsZVariable(expression: string): boolean {
  return /(?<![a-zA-Z])z(?![a-zA-Z])/.test(expression);
}

/**
 * 式のモードを判定する
 * - z= で始まる場合 → 陽関数 (explicit)
 * - z を変数として含む場合 → 陰関数 (implicit)
 * - どちらでもない場合 → エラー
 */
function detectExpressionMode(expression: string): ExpressionMode | "error" {
  if (startsWithZEquals(expression)) {
    return "explicit";
  }
  if (containsZVariable(expression)) {
    return "implicit";
  }
  return "error";
}

/**
 * z= の右辺を抽出
 */
function extractExplicitRHS(expression: string): string | null {
  const match = expression.match(/^z\s*=\s*(.+)$/);
  return match ? match[1] : null;
}

/**
 * 陰関数の関係演算子タイプ
 * - equation: 等式 (=) → DoubleSide
 * - less: 不等式 (<, <=) → FrontSide
 * - greater: 不等式 (>, >=) → BackSide
 */
export type ImplicitRelationType = "equation" | "less" | "greater";

/**
 * 陰関数式をパースして左辺・右辺・関係演算子を抽出
 * - "x^2+y^2+z^2=1" → { left: "x^2+y^2+z^2", right: "1", relationType: "equation" }
 * - "x^2+y^2+z^2<1" → { left: "x^2+y^2+z^2", right: "1", relationType: "less" }
 * - "x^2+y^2+z^2>1" → { left: "x^2+y^2+z^2", right: "1", relationType: "greater" }
 * - 演算子を含まない場合 → null（エラー）
 */
function parseImplicitExpression(expression: string): {
  left: string;
  right: string;
  relationType: ImplicitRelationType;
} | null {
  // 不等式をチェック: <=, >=, <, >, \leq, \geq, \le, \ge
  const inequalityMatch = expression.match(
    /^(.+?)\s*(\\leq|\\geq|\\le|\\ge|<=|>=|<|>)\s*(.+)$/,
  );
  if (inequalityMatch) {
    const operator = inequalityMatch[2];
    console.log("[Graph3D] Detected inequality operator:", operator);

    // < / <= / \le / \leq → "less"、> / >= / \ge / \geq → "greater"
    const isLess =
      operator === "<" ||
      operator === "<=" ||
      operator === "\\le" ||
      operator === "\\leq";

    return {
      left: inequalityMatch[1],
      right: inequalityMatch[3],
      relationType: isLess ? "less" : "greater",
    };
  }

  // 等式をチェック（z= で始まる場合は除外済み）
  const equalMatch = expression.match(/^(.+?)\s*=\s*(.+)$/);
  if (equalMatch) {
    return { left: equalMatch[1], right: equalMatch[2], relationType: "equation" };
  }

  // 演算子を含まない場合はエラー
  return null;
}

export default function Main() {
  const [currentExpression, setCurrentExpression] =
    useState<string>("z=\\sin(x)\\cos(y)");
  const [evalFunction, setEvalFunction] = useState<
    ((x: number, y: number, z?: number) => number) | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [range, setRange] = useState({
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    zMin: -5,
    zMax: 5,
  });
  const [segments, setSegments] = useState<number>(64);
  const [core, setCore] = useState<Graph3DCore | null>(null);
  const [hasLoadedFromParams, setHasLoadedFromParams] = useState(false);
  const [implicitRelation, setImplicitRelation] =
    useState<ImplicitRelationType>("equation");

  const searchParams = useSearchParams();

  // 式のモードを自動検出
  const mode = useMemo(
    () => detectExpressionMode(currentExpression),
    [currentExpression],
  );

  // Parse expression and update evalFunction
  const handleExpressionChange = useCallback((expression: string) => {
    setCurrentExpression(expression);

    console.log("[Graph3D] Input expression:", expression);

    try {
      if (!expression.trim()) {
        setError("Expression cannot be empty");
        setEvalFunction(null);
        return;
      }

      // 式のモードを判定
      const exprMode = detectExpressionMode(expression);
      console.log("[Graph3D] Detected mode:", exprMode);

      if (exprMode === "error") {
        setError("Use z=f(x,y) for explicit or include z for implicit");
        setEvalFunction(null);
        return;
      }

      let jsCode: string;
      let knownVars: string[];

      if (exprMode === "explicit") {
        // 陽関数: z= の右辺を抽出
        const rhs = extractExplicitRHS(expression);
        console.log("[Graph3D] Explicit RHS:", rhs);
        if (!rhs) {
          setError("Invalid explicit function format");
          setEvalFunction(null);
          return;
        }
        knownVars = ["x", "y", "t"];

        // LaTeX を AST に変換
        const ast = parseLatex(rhs, BUILTIN_FUNCS);
        console.log("[Graph3D] AST:", JSON.stringify(ast, null, 2));

        // AST を JavaScript コードに変換
        jsCode = ASTToJS(ast, BUILTIN_FUNCS, knownVars);
        console.log("[Graph3D] JS code:", jsCode);
      } else {
        // 陰関数: f(x,y,z) = 0 の形式に正規化
        const parsed = parseImplicitExpression(expression);
        console.log("[Graph3D] Parsed implicit:", parsed);
        if (!parsed) {
          setError("Implicit function requires =, <, >, <=, or >=");
          setEvalFunction(null);
          return;
        }

        // 関係タイプを保存（等式 or 不等式）
        setImplicitRelation(parsed.relationType);
        console.log("[Graph3D] Relation type:", parsed.relationType);

        knownVars = ["x", "y", "z", "t"];

        // 左辺と右辺をそれぞれパース
        const leftAst = parseLatex(parsed.left, BUILTIN_FUNCS);
        console.log("[Graph3D] Left AST:", JSON.stringify(leftAst, null, 2));
        const leftCode = ASTToJS(leftAst, BUILTIN_FUNCS, knownVars);
        console.log("[Graph3D] Left JS:", leftCode);

        const rightAst = parseLatex(parsed.right, BUILTIN_FUNCS);
        console.log("[Graph3D] Right AST:", JSON.stringify(rightAst, null, 2));
        const rightCode = ASTToJS(rightAst, BUILTIN_FUNCS, knownVars);
        console.log("[Graph3D] Right JS:", rightCode);

        // 左辺 - 右辺 = 0 として評価
        jsCode = `(${leftCode}) - (${rightCode})`;
        console.log("[Graph3D] Final JS code:", jsCode);
      }

      // 関数を生成
      // eslint-disable-next-line no-new-func
      const fn = new Function("x", "y", "z", "t", `return ${jsCode};`) as (
        x: number,
        y: number,
        z?: number,
        t?: number,
      ) => number;

      // ラップして設定
      const evalFn = (x: number, y: number, z?: number) => fn(x, y, z ?? 0, 0);

      // テスト評価
      console.log("[Graph3D] Test eval (0,0,0):", evalFn(0, 0, 0));
      console.log("[Graph3D] Test eval (1,0,0):", evalFn(1, 0, 0));

      setEvalFunction(() => evalFn);
      setError(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("[Graph3D] Parse error:", errorMessage);
      setError(errorMessage);
      setEvalFunction(null);
    }
  }, []);

  // Load from URL parameters (once on mount)
  useEffect(() => {
    if (searchParams && !hasLoadedFromParams) {
      const exprParam = searchParams.get("expr");
      if (exprParam !== null) {
        const decodedExpr = decodeURIComponent(exprParam);
        setCurrentExpression(decodedExpr);
        handleExpressionChange(decodedExpr);
      }

      // Load range parameters
      const xMinParam = searchParams.get("xMin");
      const xMaxParam = searchParams.get("xMax");
      const yMinParam = searchParams.get("yMin");
      const yMaxParam = searchParams.get("yMax");
      const zMinParam = searchParams.get("zMin");
      const zMaxParam = searchParams.get("zMax");

      if (
        xMinParam !== null ||
        xMaxParam !== null ||
        yMinParam !== null ||
        yMaxParam !== null ||
        zMinParam !== null ||
        zMaxParam !== null
      ) {
        setRange((prevRange) => ({
          xMin: xMinParam !== null ? +xMinParam : prevRange.xMin,
          xMax: xMaxParam !== null ? +xMaxParam : prevRange.xMax,
          yMin: yMinParam !== null ? +yMinParam : prevRange.yMin,
          yMax: yMaxParam !== null ? +yMaxParam : prevRange.yMax,
          zMin: zMinParam !== null ? +zMinParam : prevRange.zMin,
          zMax: zMaxParam !== null ? +zMaxParam : prevRange.zMax,
        }));
      }

      // Load segments parameter
      const segmentsParam = searchParams.get("segments");
      if (segmentsParam !== null) {
        setSegments(+segmentsParam);
      }

      // Load wireframe parameter
      const wireframeParam = searchParams.get("wireframe");
      if (wireframeParam !== null) {
        setWireframe(wireframeParam === "true");
      }

      setHasLoadedFromParams(true);
    }
  }, [searchParams, hasLoadedFromParams, handleExpressionChange]);

  // Handle initial expression parsing (only if not loaded from URL)
  useEffect(() => {
    if (!hasLoadedFromParams) {
      handleExpressionChange(currentExpression);
    }
  }, [hasLoadedFromParams, handleExpressionChange, currentExpression]);

  // Handle core ready callback
  const handleCoreReady = useCallback((newCore: Graph3DCore) => {
    setCore(newCore);
  }, []);

  // Handle reset camera
  const handleResetCamera = useCallback(() => {
    if (core) {
      core.resetCamera();
    }
  }, [core]);

  // Handle wireframe toggle
  const handleWireframeToggle = useCallback(() => {
    setWireframe((prev) => !prev);
  }, []);

  // Handle share link
  const handleShareLink = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      // Save expression if not default
      if (currentExpression !== "z=\\sin(x)\\cos(y)") {
        params.set("expr", encodeURIComponent(currentExpression));
      }

      // Save range if not default
      if (
        range.xMin !== -5 ||
        range.xMax !== 5 ||
        range.yMin !== -5 ||
        range.yMax !== 5
      ) {
        params.set("xMin", range.xMin.toString());
        params.set("xMax", range.xMax.toString());
        params.set("yMin", range.yMin.toString());
        params.set("yMax", range.yMax.toString());
      }

      // Save z range if in implicit mode
      if (mode === "implicit" && (range.zMin !== -5 || range.zMax !== 5)) {
        params.set("zMin", range.zMin.toString());
        params.set("zMax", range.zMax.toString());
      }

      // Save segments if not default
      if (segments !== 64) {
        params.set("segments", segments.toString());
      }

      // Save wireframe if enabled
      if (wireframe) {
        params.set("wireframe", "true");
      }

      // Generate full URL
      const baseUrl = window.location.origin + window.location.pathname;
      const queryString = params.toString();
      const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      // Update URL
      window.history.replaceState({}, "", fullUrl);

      // Copy to clipboard
      await navigator.clipboard.writeText(fullUrl);

      console.log("Link copied to clipboard:", fullUrl);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [currentExpression, range, segments, wireframe, mode]);

  // Canvas に渡すモード（エラーの場合は explicit をデフォルトとして使用）
  const canvasMode: ExpressionMode = mode === "error" ? "explicit" : mode;

  return (
    <main className="relative w-screen h-[calc(100vh-var(--header-height))] overflow-hidden">
      <Canvas
        evalFunction={evalFunction}
        mode={canvasMode}
        range={range}
        segments={segments}
        wireframe={wireframe}
        implicitRelation={implicitRelation}
        onCoreReady={handleCoreReady}
      />
      <ControlPanel
        onExpressionChange={handleExpressionChange}
        currentExpression={currentExpression}
        error={error}
        mode={mode}
      />
      <ControlButtons
        onResetCamera={handleResetCamera}
        onWireframeToggle={handleWireframeToggle}
        isWireframe={wireframe}
        onShareLink={handleShareLink}
      />
    </main>
  );
}
