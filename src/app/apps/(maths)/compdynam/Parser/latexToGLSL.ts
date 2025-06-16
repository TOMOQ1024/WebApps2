import { ASTToGLSL } from "./ASTToGLSL";
import { parseLatex } from "./parseLatex";

export function latexToGLSL(latex: string): string {
  try {
    // LaTeXをパースして抽象構文木に変換
    console.log(`latex: ${latex}`);
    const ast = parseLatex(latex);
    console.log(`ast: ${ast}`);

    // 抽象構文木をGLSLコードに変換
    let glslCode = ASTToGLSL(ast);
    console.log(`glslCode: ${glslCode}`);

    return glslCode;
  } catch (error) {
    console.error("Failed to parse LaTeX:", error);
    throw error;
  }
}
