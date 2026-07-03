import type { ASTNode } from "./ASTNode";

/**
 * AST を JavaScript のコード文字列に変換する
 * Graph3D 用に z = f(x, y) 形式の数式を評価するため
 * @param node ASTノード
 * @param knownFuncs 組み込み関数名の配列
 * @param knownVars 変数名の配列
 * @param userFuncs ユーザー定義関数名の配列
 */
export function ASTToJS(
  node: ASTNode,
  knownFuncs: string[] = [],
  knownVars: string[] = [],
  userFuncs: string[] = [],
): string {
  switch (node.type) {
    case "number":
      return `${node.value}`;

    case "symbol":
      switch (node.name) {
        case "pi":
          return "Math.PI";
        case "e":
          return "Math.E";
        default:
          if (knownVars.includes(node.name)) {
            return node.name;
          }
          throw new Error(`Unsupported symbol: ${node.name}`);
      }

    case "operator": {
      // 特別な場合：関数名 * 引数 → 関数呼び出し
      if (node.op === "*" && node.left.type === "symbol") {
        const fnName = node.left.name;
        if (knownFuncs.includes(fnName) || userFuncs.includes(fnName)) {
          const arg = ASTToJS(node.right, knownFuncs, knownVars, userFuncs);
          return convertFunctionCall(fnName, [arg], userFuncs);
        }
      }

      const left = ASTToJS(node.left, knownFuncs, knownVars, userFuncs);
      const right = ASTToJS(node.right, knownFuncs, knownVars, userFuncs);

      switch (node.op) {
        case "+":
          return `(${left} + ${right})`;
        case "-":
          // 単項マイナスの場合
          if (left === "0") {
            return `(-${right})`;
          }
          return `(${left} - ${right})`;
        case "*":
          return `(${left} * ${right})`;
        case "/":
          return `(${left} / ${right})`;
        case "^":
          return `Math.pow(${left}, ${right})`;
        default:
          throw new Error(`Unsupported operator: ${node.op}`);
      }
    }

    case "function": {
      const args = node.args.map((arg) =>
        ASTToJS(arg, knownFuncs, knownVars, userFuncs),
      );
      return convertFunctionCall(node.name, args, userFuncs);
    }
  }
}

/**
 * 関数呼び出しを JavaScript コードに変換
 * @param fnName 関数名
 * @param args 引数のコード文字列配列
 * @param userFuncs ユーザー定義関数名の配列
 */
function convertFunctionCall(
  fnName: string,
  args: string[],
  userFuncs: string[] = [],
): string {
  // ユーザー定義関数の場合
  if (userFuncs.includes(fnName)) {
    return `${fnName}(${args.join(", ")})`;
  }

  if (args.length === 0 && !["max", "min"].includes(fnName)) {
    throw new Error(`Function ${fnName} requires an argument`);
  }

  switch (fnName) {
    // 三角関数
    case "sin":
      return `Math.sin(${args[0]})`;
    case "cos":
      return `Math.cos(${args[0]})`;
    case "tan":
      return `Math.tan(${args[0]})`;
    case "cot":
      return `(1 / Math.tan(${args[0]}))`;
    case "sec":
      return `(1 / Math.cos(${args[0]}))`;
    case "csc":
      return `(1 / Math.sin(${args[0]}))`;

    // 逆三角関数
    case "arcsin":
      return `Math.asin(${args[0]})`;
    case "arccos":
      return `Math.acos(${args[0]})`;
    case "arctan":
      if (args.length === 2) {
        return `Math.atan2(${args[0]}, ${args[1]})`;
      }
      return `Math.atan(${args[0]})`;
    case "arccot":
      return `(Math.PI / 2 - Math.atan(${args[0]}))`;
    case "arcsec":
      return `Math.acos(1 / ${args[0]})`;
    case "arccsc":
      return `Math.asin(1 / ${args[0]})`;

    // 双曲線関数
    case "sinh":
      return `Math.sinh(${args[0]})`;
    case "cosh":
      return `Math.cosh(${args[0]})`;
    case "tanh":
      return `Math.tanh(${args[0]})`;
    case "coth":
      return `(1 / Math.tanh(${args[0]}))`;
    case "sech":
      return `(1 / Math.cosh(${args[0]}))`;
    case "csch":
      return `(1 / Math.sinh(${args[0]}))`;

    // 逆双曲線関数
    case "arsinh":
      return `Math.asinh(${args[0]})`;
    case "arcosh":
      return `Math.acosh(${args[0]})`;
    case "artanh":
      return `Math.atanh(${args[0]})`;
    case "arcoth":
      return `(0.5 * Math.log((${args[0]} + 1) / (${args[0]} - 1)))`;
    case "arsech":
      return `Math.acosh(1 / ${args[0]})`;
    case "arcsch":
      return `Math.asinh(1 / ${args[0]})`;

    // その他の関数
    case "exp":
      return `Math.exp(${args[0]})`;
    case "abs":
      return `Math.abs(${args[0]})`;
    case "ln":
      return `Math.log(${args[0]})`;
    case "sqrt":
      return `Math.sqrt(${args[0]})`;
    case "max":
      if (args.length === 0) {
        throw new Error("Function max requires at least one argument");
      }
      if (args.length === 1) return args[0];
      return `Math.max(${args.join(", ")})`;
    case "min":
      if (args.length === 0) {
        throw new Error("Function min requires at least one argument");
      }
      if (args.length === 1) return args[0];
      return `Math.min(${args.join(", ")})`;
    case "floor":
      return `Math.floor(${args[0]})`;
    case "ceil":
      return `Math.ceil(${args[0]})`;
    case "round":
      return `Math.round(${args[0]})`;
    case "sign":
      return `Math.sign(${args[0]})`;

    default:
      throw new Error(`Unsupported function: ${fnName}`);
  }
}

/**
 * LaTeX を JavaScript の関数に変換するラッパー
 */
export function latexToJSFunction(
  latex: string,
  parseLatex: (latex: string, knownFuncs: string[]) => ASTNode,
  knownFuncs: string[] = [
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
  ],
  knownVars: string[] = ["x", "y", "t"],
): (x: number, y: number, t?: number) => number {
  try {
    const ast = parseLatex(latex, knownFuncs);
    const jsCode = ASTToJS(ast, knownFuncs, knownVars);

    // 関数を生成
    // eslint-disable-next-line no-new-func
    const fn = new Function("x", "y", "t", `return ${jsCode};`) as (
      x: number,
      y: number,
      t?: number,
    ) => number;

    return fn;
  } catch (error) {
    throw error;
  }
}
