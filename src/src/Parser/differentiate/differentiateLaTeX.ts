import { ASTToLatex } from "../ASTToLatex";
import { parseLatex } from "../parseLatex";
import { differentiateASTNode } from "./differentiateASTNode";

export function differentiateLaTeX(
  latex: string,
  variable: string = "x",
  knownFuncs: string[] = [
    "sin",
    "cos",
    "tan",
    "cot",
    "sec",
    "csc",
    "sinh",
    "cosh",
    "tanh",
    "coth",
    "sech",
    "csch",
    "log",
    "exp",
    "sqrt",
    "ln",
  ]
): string {
  const ast = parseLatex(latex, knownFuncs);
  if (/sin|cos|x\\cos|x\^2/.test(latex)) {
    // デバッグ用: AST構造を出力
    // eslint-disable-next-line no-console
    console.log("DEBUG AST:", latex, JSON.stringify(ast, null, 2));
  }
  const diffAst = differentiateASTNode(ast, variable);
  return ASTToLatex(diffAst, true, true);
}
