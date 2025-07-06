import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { evaluateNumericOps, simplifyFraction } from "./helpers";
import { simplifyAddition } from "./simplifyAddition";
import { simplifyMultiplication } from "./simplifyMultiplication";
import { simplifyPower } from "./simplifyPower";

// 正規化されたASTを簡約化
export function simplifyNormalizedAST(
  node: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  if (node.type === "operator") {
    // まず子ノードを再帰的に簡約化
    const left = simplifyNormalizedAST(node.left, options);
    const right = simplifyNormalizedAST(node.right, options);

    // 分数の約分処理
    if (
      node.op === "/" &&
      left.type === "number" &&
      right.type === "number" &&
      Number.isInteger(left.value) &&
      Number.isInteger(right.value)
    ) {
      const { num, den } = simplifyFraction(left.value, right.value);
      if (den === 1) {
        return { type: "number", value: num };
      } else {
        return {
          type: "operator",
          op: "/",
          left: { type: "number", value: num },
          right: { type: "number", value: den },
        };
      }
    }

    // 数値計算の評価
    const numericResult = evaluateNumericOps({ ...node, left, right }, options);
    if (numericResult) return numericResult;

    switch (node.op) {
      case "+":
        return simplifyAddition(left, right, options);
      case "*":
        return simplifyMultiplication(left, right);
      case "^":
        return simplifyPower(left, right, options);
      default:
        return { ...node, left, right };
    }
  } else if (node.type === "function") {
    return {
      ...node,
      args: node.args.map((arg) => simplifyNormalizedAST(arg, options)),
    };
  }

  return node;
}
