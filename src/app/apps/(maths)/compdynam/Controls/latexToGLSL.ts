import { parse } from "mathjs";

export function latexToGLSL(latex: string): string {
  try {
    // LaTeXの関数名を通常の関数名に変換
    const cleanLatex = latex
      .replace(/\\cos/g, "cos")
      .replace(/\\sin/g, "sin")
      .replace(/\\tan/g, "tan")
      .replace(/\\exp/g, "exp")
      .replace(/\\sqrt/g, "sqrt")
      .replace(/\\abs/g, "abs")
      // 括弧の処理
      .replace(/\\left\(/g, "(")
      .replace(/\\right\)/g, ")")
      // 分数の処理
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
      .replace(/\s+/g, "")
      // 関数名と数値の間に括弧を追加
      .replace(/([a-zA-Z]+)(\d)/g, "$1($2)")
      // 数値と関数名の間に乗算記号を追加
      .replace(/(\d)([a-zA-Z]+)/g, "$1 * $2")
      // 関数名と変数名の間に括弧を追加
      .replace(/(cos|sin|tan|exp|sqrt|abs)([a-zA-Z])/g, "$1($2)");

    // LaTeXをパースして抽象構文木に変換
    const ast = parse(cleanLatex);

    // 抽象構文木をGLSLコードに変換
    return convertToGLSL(ast);
  } catch (error) {
    console.error("Failed to parse LaTeX:", error);
    throw error;
  }
}

function convertToGLSL(node: any): string {
  if (typeof node === "number") {
    return `vec2(${node.toFixed(1)}, 0.0)`;
  }

  if (typeof node === "string") {
    if (node === "z") return "z";
    if (node === "c") return "c";
    if (node === "t") return "t";
    if (node === "π" || node === "pi") return "PI";
    if (node === "e") return "E";
    if (node === "i") return "vec2(0.0, 1.0)";
    return node;
  }

  if (node.type === "SymbolNode") {
    const name = node.name;
    if (name === "z") return "z";
    if (name === "c") return "c";
    if (name === "t") return "t";
    if (name === "π" || name === "pi") return "PI";
    if (name === "e") return "E";
    if (name === "i") return "vec2(0.0, 1.0)";
    return name;
  }

  if (node.type === "ConstantNode") {
    if (node.value === "pi") return "PI";
    if (node.value === "e") return "E";
    if (node.value === "i") return "vec2(0.0, 1.0)";
    return `vec2(${node.value.toFixed(1)}, 0.0)`;
  }

  if (node.type === "OperatorNode") {
    const left = convertToGLSL(node.args[0]);
    const right = convertToGLSL(node.args[1]);

    switch (node.op) {
      case "+":
        return `${left} + ${right}`;
      case "-":
        return `${left} - ${right}`;
      case "*":
        return `cprod(${left}, ${right})`;
      case "/":
        return `cdiv(${left}, ${right})`;
      case "^":
        return `cpow(${left}, ${right})`;
      default:
        throw new Error(`Unsupported operator: ${node.op}`);
    }
  }

  if (node.type === "FunctionNode") {
    const args = node.args.map(convertToGLSL);
    const fnName = node.name.toLowerCase();

    switch (fnName) {
      case "sin":
        return `csin(${args[0]})`;
      case "cos":
        return `ccos(${args[0]})`;
      case "tan":
        return `ctan(${args[0]})`;
      case "exp":
        return `cexp(${args[0]})`;
      case "sqrt":
        return `csqrt(${args[0]})`;
      case "abs":
        return `cabs(${args[0]})`;
      default:
        throw new Error(`Unsupported function: ${fnName}`);
    }
  }

  throw new Error(`Unsupported node type: ${node.type}`);
}
