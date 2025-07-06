import { ASTNode } from "../ASTNode";
import { flattenMultiplication } from "./flattenMultiplication";

// 項から係数と基底を抽出
export function extractCoefficient(term: ASTNode): {
  coefficient: number;
  base: ASTNode;
} {
  if (term.type === "number") {
    return { coefficient: term.value, base: { type: "number", value: 1 } };
  }

  // 乗算の場合、数値因子と非数値因子に分ける
  if (term.type === "operator" && term.op === "*") {
    const factors = flattenMultiplication(term.left, term.right);
    let coefficient = 1;
    const nonNumericFactors: ASTNode[] = [];

    for (const factor of factors) {
      if (factor.type === "number") {
        coefficient *= factor.value;
      } else {
        nonNumericFactors.push(factor);
      }
    }

    const base =
      nonNumericFactors.length === 0
        ? { type: "number" as const, value: 1 }
        : nonNumericFactors.length === 1
        ? nonNumericFactors[0]
        : nonNumericFactors.reduce((a, b) => ({
            type: "operator" as const,
            op: "*",
            left: a,
            right: b,
          }));

    return { coefficient, base };
  }

  // 負の係数の処理: (-1) * expr
  if (
    term.type === "operator" &&
    term.op === "*" &&
    term.left.type === "number" &&
    term.left.value === -1
  ) {
    return { coefficient: -1, base: term.right };
  }

  // その他の場合は係数1、基底は項そのもの
  return { coefficient: 1, base: term };
}
