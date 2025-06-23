import { ASTToGLSL } from "./ASTToGLSL";
import { parseLatex } from "./parseLatex";

export function latexToGLSL(
  latex: string,
  knownFuncs: string[] = [
    "sin",
    "cos",
    "tan",
    "exp",
    "sinh",
    "cosh",
    "tanh",
    "abs",
    "sqrt",
    "log",
    "Log",
    "re",
    "Re",
    "im",
    "Im",
    "conj",
    "arg",
    "Arg",
  ],
  knownVars: string[] = ["z", "c", "t"]
): string {
  try {
    // LaTeXをパースして抽象構文木に変換
    console.log(`latex: ${latex}`);
    const ast = parseLatex(latex, knownFuncs);

    // 抽象構文木をGLSLコードに変換
    let glslCode = ASTToGLSL(ast, knownVars);
    console.log(`glslCode: ${glslCode}`);

    return glslCode;
  } catch (error) {
    throw error;
  }
}
