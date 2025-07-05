import { ASTToLatex } from "../ASTToLatex";
import { parseLatex } from "../parseLatex";
import { differentiateASTNode } from "./differentiateASTNode";
import { optimizeAST } from "../ASTToLatex";

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
  if (/x\^{-1}/.test(latex)) {
    // eslint-disable-next-line no-console
    console.log("DEBUG RAW DIFF AST:", JSON.stringify(diffAst, null, 2));
  }
  const optimizedAst = optimizeAST(diffAst);
  // デバッグ: x^{-1}の微分ASTを出力
  if (/x\^{-1}/.test(latex)) {
    // eslint-disable-next-line no-console
    console.log("DEBUG DIFF AST:", JSON.stringify(optimizedAst, null, 2));
  }
  // デバッグ: 分数の微分ASTを出力
  if (/\\frac/.test(latex)) {
    // eslint-disable-next-line no-console
    console.log("DEBUG FRAC DIFF AST:", JSON.stringify(optimizedAst, null, 2));
  }
  return ASTToLatex(optimizedAst, true, true);
}
