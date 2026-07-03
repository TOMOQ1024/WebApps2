import { ASTNode } from "../ASTNode";

// 因子から指数と基底を抽出
export function extractExponent(factor: ASTNode): {
  exponent: number;
  base: ASTNode;
} {
  if (factor.type === "operator" && factor.op === "^") {
    // 指数が数値の場合
    if (factor.right.type === "number") {
      return { exponent: factor.right.value, base: factor.left };
    }

    // 指数が(-1)*n形式の場合
    if (
      factor.right.type === "operator" &&
      factor.right.op === "*" &&
      factor.right.left.type === "number" &&
      factor.right.left.value === -1 &&
      factor.right.right.type === "number"
    ) {
      return { exponent: -factor.right.right.value, base: factor.left };
    }
  }

  return { exponent: 1, base: factor };
}
