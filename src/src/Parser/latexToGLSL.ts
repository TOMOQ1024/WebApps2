import { ASTToGLSL } from "./ASTToGLSL";
import { parseLatex } from "./parseLatex";

export function latexToGLSL(
  latex: string,
  knownFuncs: string[] = [
    "sin",
    "cos",
    "tan",
    "cot",
    "sec",
    "csc",
    "exp",
    "sinh",
    "cosh",
    "tanh",
    "coth",
    "sech",
    "csch",
    "abs",
    "ln",
    "floor",
    "ceil",
    "round",
    "fract",
  ],
  knownVars: string[] = ["x", "y", "t"],
): string {
  try {
    // LaTeXをパースして抽象構文木に変換
    const ast = parseLatex(latex, knownFuncs);

    // 抽象構文木をGLSLコードに変換
    const glslCode = ASTToGLSL(ast, knownFuncs, knownVars);

    return glslCode;
  } catch (error) {
    throw error;
  }
}
