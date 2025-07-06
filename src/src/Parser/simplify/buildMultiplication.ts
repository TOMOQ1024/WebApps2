import { ASTNode } from "../ASTNode";

// 乗算を構築
export function buildMultiplication(
  groups: Map<string, { exponent: number; base: ASTNode }>
): ASTNode {
  const factors: ASTNode[] = [];

  for (const { exponent, base } of groups.values()) {
    if (exponent === 0) continue;

    if (exponent === 1) {
      factors.push(base);
    } else {
      factors.push({
        type: "operator",
        op: "^",
        left: base,
        right: { type: "number", value: exponent },
      });
    }
  }

  if (factors.length === 0) {
    return { type: "number", value: 1 };
  } else if (factors.length === 1) {
    return factors[0];
  } else {
    return factors.reduce((a, b) => ({
      type: "operator",
      op: "*",
      left: a,
      right: b,
    }));
  }
}
