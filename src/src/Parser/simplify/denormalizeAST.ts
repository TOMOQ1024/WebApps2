import { ASTNode } from "../ASTNode";

// 正規化されたASTを元の形式に戻す
export function denormalizeAST(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    const left = denormalizeAST(node.left);
    const right = denormalizeAST(node.right);

    // (-1) * a → -a に変換
    if (node.op === "*" && left.type === "number" && left.value === -1) {
      return {
        type: "operator",
        op: "-",
        left: { type: "number", value: 0 },
        right: right,
      };
    }

    // a * (b^(-1)) → a / b に変換
    if (
      node.op === "*" &&
      right.type === "operator" &&
      right.op === "^" &&
      right.right.type === "number" &&
      right.right.value === -1
    ) {
      return {
        type: "operator",
        op: "/",
        left: left,
        right: right.left,
      };
    }

    // 乗算の中で負の指数を持つ因子を分数に変換
    if (node.op === "*") {
      const factors = flattenMultiplication(left, right);
      const positiveFactors: ASTNode[] = [];
      const negativeFactors: ASTNode[] = [];

      for (const factor of factors) {
        if (
          factor.type === "operator" &&
          factor.op === "^" &&
          factor.right.type === "number" &&
          factor.right.value < 0
        ) {
          // 負の指数を正の指数に変換して分母に移動
          negativeFactors.push({
            type: "operator",
            op: "^",
            left: factor.left,
            right: { type: "number", value: -factor.right.value },
          });
        } else {
          positiveFactors.push(factor);
        }
      }

      // 分数形式に変換
      if (negativeFactors.length > 0) {
        const numerator =
          positiveFactors.length === 0
            ? { type: "number" as const, value: 1 }
            : positiveFactors.length === 1
            ? positiveFactors[0]
            : positiveFactors.reduce((a, b) => ({
                type: "operator" as const,
                op: "*",
                left: a,
                right: b,
              }));

        const denominator =
          negativeFactors.length === 1
            ? negativeFactors[0]
            : negativeFactors.reduce((a, b) => ({
                type: "operator" as const,
                op: "*",
                left: a,
                right: b,
              }));

        return {
          type: "operator" as const,
          op: "/",
          left: numerator,
          right: denominator,
        };
      }
    }

    return { ...node, left, right };
  } else if (node.type === "function") {
    return { ...node, args: node.args.map(denormalizeAST) };
  }

  return node;
}
