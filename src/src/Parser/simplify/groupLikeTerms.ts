import { ASTNode } from "../ASTNode";
import { extractCoefficient } from "./extractCoefficient";

// 同類項をグループ化
export function groupLikeTerms(
  terms: ASTNode[]
): Map<string, { coefficient: number; base: ASTNode }> {
  const groups = new Map<string, { coefficient: number; base: ASTNode }>();

  for (const term of terms) {
    const { coefficient, base } = extractCoefficient(term);
    const baseKey = JSON.stringify(base);

    const existing = groups.get(baseKey);
    if (existing) {
      existing.coefficient += coefficient;
    } else {
      groups.set(baseKey, { coefficient, base });
    }
  }

  return groups;
}
