import { ASTNode } from "../ASTNode";
import { extractExponent } from "./extractExponent";

// 同じ底の因子をグループ化
export function groupLikeFactors(
  factors: ASTNode[]
): Map<string, { exponent: number; base: ASTNode }> {
  const groups = new Map<string, { exponent: number; base: ASTNode }>();

  for (const factor of factors) {
    const { exponent, base } = extractExponent(factor);
    const baseKey = JSON.stringify(base);

    const existing = groups.get(baseKey);
    if (existing) {
      existing.exponent += exponent;
    } else {
      groups.set(baseKey, { exponent, base });
    }
  }

  return groups;
}
