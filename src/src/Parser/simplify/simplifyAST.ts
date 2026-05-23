import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { normalizeAST } from "./normalizeAST";
import { simplifyNormalizedAST } from "./simplifyNormalizedAST";
import { denormalizeAST } from "./denormalizeAST";
import { simplifyNumericFractions } from "./simplifyNumericFractions";

// 内部用の簡約化関数（nested fraction前処理なし）
function simplifyASTInternal(
  node: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  // 子ノードを先に簡約化
  let simplified = node;

  if (node.type === "operator") {
    const leftSimplified = simplifyASTInternal(node.left, options);
    const rightSimplified = simplifyASTInternal(node.right, options);

    simplified = {
      ...node,
      left: leftSimplified,
      right: rightSimplified,
    };
  } else if (node.type === "function") {
    simplified = {
      ...node,
      args: node.args.map((arg) => simplifyASTInternal(arg, options)),
    };
  }

  // 通常の簡約化プロセス
  const normalized = normalizeAST(simplified);
  const normalizedSimplified = simplifyNormalizedAST(normalized, options);
  let result = denormalizeAST(normalizedSimplified, options);

  // 分数の数値約分を行う
  result = simplifyNumericFractions(result);

  return result;
}

// ASTの簡約化（外部用）
export function simplifyAST(node: ASTNode, options?: SimplifyOptions): ASTNode {
  // 最初にnested fractionを処理（前処理）
  let preprocessed = node;
  if (options?.rationalMode === "fraction") {
    preprocessed = simplifyNumericFractions(node);
  }

  return simplifyASTInternal(preprocessed, options);
}
