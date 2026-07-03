"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ASTToJS } from "@/src/Parser/ASTToJS";
import {
  type FunctionDef,
  parseFunctionDef,
} from "@/src/Parser/graph2d/expressionParser";
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
  "fract",
  "sign",
];

/**
 * z を変数として含むかチェック（関数名の一部ではなく独立した変数として）
 */
function containsZVariable(expression: string): boolean {
  return /(?<![a-zA-Z])z(?![a-zA-Z])/.test(expression);
}

/**
 * 関数定義から JavaScript 関数コードを生成
 * f(x) = x^2 → function f(x) { return Math.pow(x, 2); }
 */
function generateJSFunction(
  def: FunctionDef,
  previousFuncNames: string[],
): string {
  const knownFuncs = [...BUILTIN_FUNCS, ...previousFuncNames];
  const knownVars = [...def.args, "t"]; // 関数の引数 + t（時間）

  try {
    const ast = parseLatex(def.body, knownFuncs);
    const jsCode = ASTToJS(ast, BUILTIN_FUNCS, knownVars, previousFuncNames);
    return `function ${def.name}(${def.args.join(", ")}) { return ${jsCode}; }`;
  } catch (e) {
    throw e;
  }
}

/**
 * 関係演算子タイプ
 * - equation: 等式 (=) → DoubleSide
 * - less: 不等式 (<, <=) → FrontSide
 * - greater: 不等式 (>, >=) → BackSide
 */
export type RelationType = "equation" | "less" | "greater";

/**
 * z で始まる陽関数式をパース
 * - "z=f(x,y)" → { rhs: "f(x,y)", relationType: "equation" }
 * - "z<f(x,y)" → { rhs: "f(x,y)", relationType: "less" }
 * - "z>f(x,y)" → { rhs: "f(x,y)", relationType: "greater" }
 */
function parseExplicitExpression(expression: string): {
  rhs: string;
  relationType: RelationType;
} | null {
  // z で始まり、演算子（=, <, >, <=, >=, \le, \leq, \ge, \geq）が続くパターン
  // (?![a-zA-Z]) で \left などを除外
  const match = expression.match(
    /^z\s*(\\leq(?![a-zA-Z])|\\geq(?![a-zA-Z])|\\le(?![a-zA-Z])|\\ge(?![a-zA-Z])|<=|>=|<|>|=)\s*(.+)$/,
  );
  if (!match) return null;

  const operator = match[1];
  const rhs = match[2];

  let relationType: RelationType;
  if (operator === "=") {
    relationType = "equation";
  } else if (
    operator === "<" ||
    operator === "<=" ||
    operator === "\\le" ||
    operator === "\\leq"
  ) {
    relationType = "less";
  } else {
    relationType = "greater";
  }

  return { rhs, relationType };
}

/**
 * 等号・不等号を含むかチェック（\left, \right などは除外）
 */
function containsRelationalOperator(expression: string): boolean {
  return /(?<!\\left|\\right)(=|<|>|\\le(?![a-zA-Z])|\\ge(?![a-zA-Z])|\\leq|\\geq)/.test(
    expression,
  );
}

/**
 * 式のモードを判定する
 * - z で始まり、右辺に z を含まない場合 → 陽関数 (explicit)
 * - z で始まり、右辺に z を含む場合 → 陰関数 (implicit)
 * - z を変数として含む場合 → 陰関数 (implicit)
 * - 等号・不等号を含む場合（z なし）→ 陰関数 (implicit, 例: x^2+y^2=1)
 * - どちらでもない場合 → エラー
 */
function detectExpressionMode(expression: string): ExpressionMode | "error" {
  const explicitParsed = parseExplicitExpression(expression);
  if (explicitParsed) {
    // 右辺に z が含まれているかチェック
    if (containsZVariable(explicitParsed.rhs)) {
      // z= で始まるが右辺に z が含まれる → 陰関数
      return "implicit";
    }
    return "explicit";
  }
  if (containsZVariable(expression)) {
    return "implicit";
  }
  // z を含まなくても等号・不等号があれば陰関数（例: x^2+y^2=1）
  if (containsRelationalOperator(expression)) {
    return "implicit";
  }
  return "error";
}

// ImplicitRelationType は RelationType のエイリアス（後方互換性のため）
export type ImplicitRelationType = RelationType;

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
  // (?![a-zA-Z]) で \left, \get などのコマンドを除外
  const inequalityMatch = expression.match(
    /^(.+?)\s*(\\leq(?![a-zA-Z])|\\geq(?![a-zA-Z])|\\le(?![a-zA-Z])|\\ge(?![a-zA-Z])|<=|>=|<|>)\s*(.+)$/,
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
    return {
      left: equalMatch[1],
      right: equalMatch[2],
      relationType: "equation",
    };
  }

  // 演算子を含まない場合はエラー
  return null;
}

export default function Main() {
  const [currentExpressions, setCurrentExpressions] = useState<string[]>([
    "z=\\sin(x)\\cos(y)",
  ]);
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
  const [relationType, setRelationType] = useState<RelationType>("equation");

  const searchParams = useSearchParams();

  // 式のモードを自動検出（メイン式のみを対象）
  const mode = useMemo(() => {
    // 関数定義でない行（メイン式）を抽出
    for (const expr of currentExpressions) {
      const trimmed = expr.trim();
      if (trimmed && !parseFunctionDef(trimmed)) {
        return detectExpressionMode(trimmed);
      }
    }
    return "error" as const;
  }, [currentExpressions]);

  // Parse expressions and update evalFunction
  const handleExpressionsChange = useCallback((expressions: string[]) => {
    setCurrentExpressions(expressions);

    console.log("[Graph3D] Input expressions:", expressions);

    try {
      // 空でない式のみ処理
      const nonEmptyExpressions = expressions
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      if (nonEmptyExpressions.length === 0) {
        setError("Expression cannot be empty");
        setEvalFunction(null);
        return;
      }

      // 関数定義と評価式を分離
      const functionDefs: FunctionDef[] = [];
      let mainExpression: string | null = null;

      for (const expr of nonEmptyExpressions) {
        const funcDef = parseFunctionDef(expr);
        if (funcDef) {
          console.log("[Graph3D] Found function definition:", funcDef.name);
          functionDefs.push(funcDef);
        } else {
          // 関数定義でない行 → 評価式
          if (mainExpression === null) {
            mainExpression = expr;
          } else {
            // 複数の評価式がある場合はエラー
            setError("Only one main expression is allowed");
            setEvalFunction(null);
            return;
          }
        }
      }

      if (!mainExpression) {
        setError("No main expression found");
        setEvalFunction(null);
        return;
      }

      console.log("[Graph3D] Main expression:", mainExpression);
      console.log("[Graph3D] Function definitions:", functionDefs.length);

      // 式のモードを判定
      const exprMode = detectExpressionMode(mainExpression);
      console.log("[Graph3D] Detected mode:", exprMode);

      if (exprMode === "error") {
        setError("Use z=f(x,y) for explicit or include z for implicit");
        setEvalFunction(null);
        return;
      }

      // ユーザー定義関数の JavaScript コードを生成（重複チェック）
      const userFuncNames = functionDefs.map((def) => def.name);
      const duplicateNames = userFuncNames.filter(
        (name, index) => userFuncNames.indexOf(name) !== index,
      );
      if (duplicateNames.length > 0) {
        setError(`Duplicate function definition: ${duplicateNames[0]}`);
        setEvalFunction(null);
        return;
      }

      const jsFunctions: string[] = [];

      for (let i = 0; i < functionDefs.length; i++) {
        const def = functionDefs[i];
        const previousFuncNames = functionDefs.slice(0, i).map((d) => d.name);
        const jsFunc = generateJSFunction(def, previousFuncNames);
        console.log(`[Graph3D] Generated function ${def.name}:`, jsFunc);
        jsFunctions.push(jsFunc);
      }

      let jsCode: string;
      let knownVars: string[];
      const allKnownFuncs = [...BUILTIN_FUNCS, ...userFuncNames];

      if (exprMode === "explicit") {
        // 陽関数: z(...) の形式をパース
        const parsed = parseExplicitExpression(mainExpression);
        console.log("[Graph3D] Parsed explicit:", parsed);
        if (!parsed) {
          setError("Invalid explicit function format");
          setEvalFunction(null);
          return;
        }

        // 関係タイプを保存（等式 or 不等式）
        setRelationType(parsed.relationType);
        console.log("[Graph3D] Relation type:", parsed.relationType);

        knownVars = ["x", "y", "t"];

        // LaTeX を AST に変換
        const ast = parseLatex(parsed.rhs, allKnownFuncs);
        console.log("[Graph3D] AST:", JSON.stringify(ast, null, 2));

        // AST を JavaScript コードに変換
        jsCode = ASTToJS(ast, BUILTIN_FUNCS, knownVars, userFuncNames);
        console.log("[Graph3D] JS code:", jsCode);
      } else {
        // 陰関数: f(x,y,z) = 0 の形式に正規化
        const parsed = parseImplicitExpression(mainExpression);
        console.log("[Graph3D] Parsed implicit:", parsed);
        if (!parsed) {
          setError("Implicit function requires =, <, >, <=, or >=");
          setEvalFunction(null);
          return;
        }

        // 関係タイプを保存（等式 or 不等式）
        setRelationType(parsed.relationType);
        console.log("[Graph3D] Relation type:", parsed.relationType);

        knownVars = ["x", "y", "z", "t"];

        // 左辺と右辺をそれぞれパース
        const leftAst = parseLatex(parsed.left, allKnownFuncs);
        console.log("[Graph3D] Left AST:", JSON.stringify(leftAst, null, 2));
        const leftCode = ASTToJS(
          leftAst,
          BUILTIN_FUNCS,
          knownVars,
          userFuncNames,
        );
        console.log("[Graph3D] Left JS:", leftCode);

        const rightAst = parseLatex(parsed.right, allKnownFuncs);
        console.log("[Graph3D] Right AST:", JSON.stringify(rightAst, null, 2));
        const rightCode = ASTToJS(
          rightAst,
          BUILTIN_FUNCS,
          knownVars,
          userFuncNames,
        );
        console.log("[Graph3D] Right JS:", rightCode);

        // 左辺 - 右辺 = 0 として評価
        jsCode = `(${leftCode}) - (${rightCode})`;
        console.log("[Graph3D] Final JS code:", jsCode);
      }

      // 関数を生成（ユーザー定義関数を含む）
      const fullCode = `
        ${jsFunctions.join("\n")}
        return ${jsCode};
      `;
      console.log("[Graph3D] Full code:", fullCode);

      // eslint-disable-next-line no-new-func
      const fn = new Function("x", "y", "z", "t", fullCode) as (
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
      setError(errorMessage);
      setEvalFunction(null);
    }
  }, []);

  // Load from URL parameters and handle initial expression parsing (once on mount)
  // currentExpressions と handleExpressionsChange は意図的に依存配列から除外（初回マウント時のみ実行）
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally run only on mount
  useEffect(() => {
    if (searchParams && !hasLoadedFromParams) {
      const exprParam = searchParams.get("expr");
      let expressionsToUse = currentExpressions;

      if (exprParam !== null) {
        const decodedExpr = decodeURIComponent(exprParam);
        // 改行で分割して配列に
        expressionsToUse = decodedExpr.split("\n").filter((e) => e.trim());
        setCurrentExpressions(expressionsToUse);
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

      // Parse the expressions (URL param or default)
      handleExpressionsChange(expressionsToUse);

      setHasLoadedFromParams(true);
    }
  }, [searchParams, hasLoadedFromParams]);

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

      // Save expressions if not default
      const expressionsStr = currentExpressions.join("\n");
      if (expressionsStr !== "z=\\sin(x)\\cos(y)") {
        params.set("expr", encodeURIComponent(expressionsStr));
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
  }, [currentExpressions, range, segments, wireframe, mode]);

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
        relationType={relationType}
        onCoreReady={handleCoreReady}
      />
      <ControlPanel
        onExpressionsChange={handleExpressionsChange}
        currentExpressions={currentExpressions}
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
