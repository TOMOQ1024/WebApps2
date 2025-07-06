import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { evaluateNumericOps } from "./helpers";
import { simplifyAddition } from "./simplifyAddition";
import { simplifyMultiplication } from "./simplifyMultiplication";
import { simplifyPower } from "./simplifyPower";

// 乗算結果の中の数値べき乗を評価する
function evaluateNumericPowersInMultiplication(
  node: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  if (node.type === "operator" && node.op === "*") {
    const left = evaluateNumericPowersInMultiplication(node.left, options);
    const right = evaluateNumericPowersInMultiplication(node.right, options);
    return { ...node, left, right };
  } else if (node.type === "operator" && node.op === "^") {
    // べき乗ノードの場合、数値評価を試行
    const numericResult = evaluateNumericOps(node, options);
    return numericResult || node;
  } else {
    return node;
  }
}

// 正規化されたASTを簡約化
export function simplifyNormalizedAST(
  node: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  if (node.type === "operator") {
    // まず子ノードを再帰的に簡約化
    const left = simplifyNormalizedAST(node.left, options);
    const right = simplifyNormalizedAST(node.right, options);

    switch (node.op) {
      case "+":
        return simplifyAddition(left, right, options);
      case "*":
        const multiplicationResult = simplifyMultiplication(left, right);
        // 乗算結果の中に数値べき乗がある場合、数値評価を実行
        return evaluateNumericPowersInMultiplication(
          multiplicationResult,
          options
        );
      case "^":
        // べき乗の場合は先にsimplifyPowerを実行
        const powerResult = simplifyPower(left, right, options);
        // 数値計算は構造変換が行われなかった場合のみ
        if (powerResult.type === "operator" && powerResult.op === "^") {
          const powerNumericResult = evaluateNumericOps(powerResult, options);
          return powerNumericResult || powerResult;
        }
        // 展開結果の中の数値べき乗も評価
        const finalResult = evaluateNumericPowersInMultiplication(
          powerResult,
          options
        );
        return finalResult;
      default:
        // その他の演算子の場合は数値計算を先に試行
        const numericResult = evaluateNumericOps(
          { ...node, left, right },
          options
        );
        return numericResult || { ...node, left, right };
    }
  } else if (node.type === "function") {
    return {
      ...node,
      args: node.args.map((arg) => simplifyNormalizedAST(arg, options)),
    };
  }

  return node;
}
