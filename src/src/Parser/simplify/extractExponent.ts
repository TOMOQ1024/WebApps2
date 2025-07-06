import { ASTNode } from "../ASTNode";

// 因子から指数と基底を抽出
export function extractExponent(factor: ASTNode): {
  exponent: number;
  base: ASTNode;
} {
  if (
    factor.type === "operator" &&
    factor.op === "^" &&
    factor.right.type === "number"
  ) {
    return { exponent: factor.right.value, base: factor.left };
  }

  return { exponent: 1, base: factor };
}
