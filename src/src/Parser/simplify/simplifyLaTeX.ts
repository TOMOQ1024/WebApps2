import { ASTToLatex } from "../ASTToLatex";
import { parseLatex } from "../parseLatex";
import { simplifyAST } from "../simplify/simplifyAST";
import { simplifyNumericFractions } from "../simplify/simplifyNumericFractions";

export interface SimplifyOptions {
  /** 数値の計算方式: 'computed' = 計算結果, 'factored' = 素因数分解型 */
  numericMode?: "computed" | "factored";
  /** 項の順序: 'dictionary' = 辞書順, 'priority' = 優先順位順 */
  termOrder?: "dictionary" | "priority";
  /** 有理式の表記: 'fraction' = 分数, 'exponent' = 指数表記 */
  rationalMode?: "fraction" | "exponent";
}

const DEFAULT_OPTIONS: Required<SimplifyOptions> = {
  numericMode: "factored",
  termOrder: "priority",
  rationalMode: "exponent",
};

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
  ],
  options: SimplifyOptions = {}
): string {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const ast = parseLatex(latex, knownFuncs);

  let simplifiedAst = simplifyAST(ast, mergedOptions);

  // 追加的に分数の数値約分を行う（特に分数形式の場合）
  if (mergedOptions.rationalMode === "fraction") {
    simplifiedAst = simplifyNumericFractions(simplifiedAst);
  }

  const result = ASTToLatex(simplifiedAst, true, "", mergedOptions);

  return result;
}
