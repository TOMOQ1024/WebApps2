import { ASTNode } from "../ASTNode";
import { evaluateNumericOps } from "./helpers";
import { simplifyAddition } from "./simplifyAddition";
import { simplifyMultiplication } from "./simplifyMultiplication";
import { simplifyPower } from "./simplifyPower";

// 正規化されたASTを簡約化
export function simplifyNormalizedAST(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    // まず子ノードを再帰的に簡約化
    const left = simplifyNormalizedAST(node.left);
    const right = simplifyNormalizedAST(node.right);

    // 数値計算の評価
    const numericResult = evaluateNumericOps({ ...node, left, right });
    if (numericResult) return numericResult;

    switch (node.op) {
      case "+":
        return simplifyAddition(left, right);
      case "*":
        return simplifyMultiplication(left, right);
      case "^":
        return simplifyPower(left, right);
      default:
        return { ...node, left, right };
    }
  } else if (node.type === "function") {
    return { ...node, args: node.args.map(simplifyNormalizedAST) };
  }

  return node;
}
