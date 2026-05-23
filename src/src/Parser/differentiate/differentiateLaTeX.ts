import { ASTToLatex } from "../ASTToLatex";
import { parseLatex } from "../parseLatex";
import { differentiateASTNode } from "./differentiateASTNode";
import { simplifyAST } from "../simplify/simplifyAST";

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

  const diffAst = differentiateASTNode(ast, variable);
  const simplifiedAst = simplifyAST(diffAst);
  return ASTToLatex(simplifiedAst, true);
}
