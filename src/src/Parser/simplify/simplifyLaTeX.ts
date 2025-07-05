import { ASTToLatex } from "../ASTToLatex";
import { parseLatex } from "../parseLatex";
import { simplifyAST } from "../simplify/simplifyAST";

export function simplifyLaTeX(
  latex: string,
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
  const simplifiedAst = simplifyAST(ast);
  return ASTToLatex(simplifiedAst, true);
}
