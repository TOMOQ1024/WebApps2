import { ASTNode } from "../ASTNode";
import { tryFactorization } from "./tryFactorization";

// 加算を構築
export function buildAddition(
  groups: Map<string, { coefficient: number; base: ASTNode }>
): ASTNode {
  const terms: ASTNode[] = [];

  for (const { coefficient, base } of groups.values()) {
    if (coefficient === 0) continue;

    if (base.type === "number" && base.value === 1) {
      // 定数項
      terms.push({ type: "number", value: coefficient });
    } else if (coefficient === 1) {
      terms.push(base);
    } else if (coefficient === -1) {
      terms.push({
        type: "operator",
        op: "*",
        left: { type: "number", value: -1 },
        right: base,
      });
    } else {
      terms.push({
        type: "operator",
        op: "*",
        left: { type: "number", value: coefficient },
        right: base,
      });
    }
  }

  if (terms.length === 0) {
    return { type: "number", value: 0 };
  } else if (terms.length === 1) {
    return terms[0];
  } else {
    const result = terms.reduce((a, b) => ({
      type: "operator",
      op: "+",
      left: a,
      right: b,
    }));

    // 簡単な因数分解を試行
    return tryFactorization(result);
  }
}
