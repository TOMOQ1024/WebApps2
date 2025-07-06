import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { flattenMultiplication } from "./flattenMultiplication";

// 正規化されたASTを元の形式に戻す
export function denormalizeAST(
  node: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  if (node.type === "operator") {
    const left = denormalizeAST(node.left, options);
    const right = denormalizeAST(node.right, options);

    // (-1) * a → -a に変換
    if (node.op === "*" && left.type === "number" && left.value === -1) {
      return {
        type: "operator",
        op: "-",
        left: { type: "number", value: 0 },
        right: right,
      };
    }

    // a^{-1} → 1/a に変換（rationalModeに基づく）
    if (
      options?.rationalMode === "fraction" &&
      node.op === "^" &&
      right.type === "number" &&
      right.value === -1
    ) {
      return {
        type: "operator",
        op: "/",
        left: { type: "number", value: 1 },
        right: left,
      };
    }

    // a * (b^(-1)) → a / b に変換（rationalModeに基づく）
    if (
      options?.rationalMode === "fraction" &&
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

    // 乗算の中で負の指数を持つ因子を処理（rationalModeに基づく）
    if (options?.rationalMode === "fraction" && node.op === "*") {
      const factors = flattenMultiplication(left, right);
      const numeratorFactors: ASTNode[] = [];
      const denominatorFactors: ASTNode[] = [];

      for (const factor of factors) {
        if (
          factor.type === "operator" &&
          factor.op === "^" &&
          factor.right.type === "number" &&
          factor.right.value < 0
        ) {
          // 負の指数を持つ因子は分母に
          if (factor.right.value === -1) {
            denominatorFactors.push(factor.left);
          } else {
            denominatorFactors.push({
              type: "operator",
              op: "^",
              left: factor.left,
              right: { type: "number", value: -factor.right.value },
            });
          }
        } else {
          numeratorFactors.push(factor);
        }
      }

      if (denominatorFactors.length > 0) {
        const numerator =
          numeratorFactors.length === 0
            ? { type: "number" as const, value: 1 }
            : numeratorFactors.length === 1
            ? numeratorFactors[0]
            : numeratorFactors.reduce((a, b) => ({
                type: "operator" as const,
                op: "*",
                left: a,
                right: b,
              }));

        const denominator =
          denominatorFactors.length === 1
            ? denominatorFactors[0]
            : denominatorFactors.reduce((a, b) => ({
                type: "operator",
                op: "*",
                left: a,
                right: b,
              }));

        return {
          type: "operator",
          op: "/",
          left: numerator,
          right: denominator,
        };
      }
    }

    return { ...node, left, right };
  } else if (node.type === "function") {
    return {
      ...node,
      args: node.args.map((arg) => denormalizeAST(arg, options)),
    };
  }

  return node;
}
