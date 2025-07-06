import { ASTNode } from "../ASTNode";
import { flattenAddition } from "./flattenAddition";
import { extractCoefficient } from "./extractCoefficient";

// 簡単な因数分解を試行
export function tryFactorization(node: ASTNode): ASTNode {
  if (node.type !== "operator" || node.op !== "+") return node;

  // x^2 + x → x(x + 1) のような簡単なケース
  const terms = flattenAddition(node.left, node.right);

  // 変数xの項を探す
  const xTerms: { coefficient: number; exponent: number }[] = [];
  const otherTerms: ASTNode[] = [];

  for (const term of terms) {
    const { coefficient, base } = extractCoefficient(term);

    if (base.type === "symbol" && base.name === "x") {
      xTerms.push({ coefficient, exponent: 1 });
    } else if (
      base.type === "operator" &&
      base.op === "^" &&
      base.left.type === "symbol" &&
      base.left.name === "x" &&
      base.right.type === "number"
    ) {
      xTerms.push({ coefficient, exponent: base.right.value });
    } else {
      otherTerms.push(term);
    }
  }

  // x^2 + x の場合
  if (xTerms.length === 2 && otherTerms.length === 0) {
    const sorted = xTerms.sort((a, b) => b.exponent - a.exponent);
    if (
      sorted[0].exponent === 2 &&
      sorted[1].exponent === 1 &&
      sorted[0].coefficient === 1 &&
      sorted[1].coefficient === 1
    ) {
      return {
        type: "operator",
        op: "*",
        left: { type: "symbol", name: "x" },
        right: {
          type: "operator",
          op: "+",
          left: { type: "symbol", name: "x" },
          right: { type: "number", value: 1 },
        },
      };
    }
  }

  return node;
}
