import { ASTToLatex } from "../ASTToLatex";
import { parseLatex } from "../parseLatex";
import { differentiateASTNode } from "./differentiateASTNode";

export function differentiateLaTeX(
  latex: string,
  variable: string = "x",
  knownFuncs: string[] = ["sin", "cos", "tan", "log", "exp", "sqrt", "ln"]
): string {
  const ast = parseLatex(latex, knownFuncs);
  const diffAst = differentiateASTNode(ast, variable);
  return ASTToLatex(diffAst, true);
}
