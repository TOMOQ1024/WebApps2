import { ASTNode } from "../ASTNode";
import { isZero, isOne } from "./helpers";
import { flattenMultiplication } from "./flattenMultiplication";
import { groupLikeFactors } from "./groupLikeFactors";
import { buildMultiplication } from "./buildMultiplication";

// 乗算の簡約化
export function simplifyMultiplication(left: ASTNode, right: ASTNode): ASTNode {
  // 0 * a → 0, a * 0 → 0
  if (isZero(left) || isZero(right)) return { type: "number", value: 0 };

  // 1 * a → a, a * 1 → a
  if (isOne(left)) return right;
  if (isOne(right)) return left;

  // 乗算項を平坦化
  const factors = flattenMultiplication(left, right);

  // 同じ底の指数をまとめる
  const grouped = groupLikeFactors(factors);

  // 結果を構築
  return buildMultiplication(grouped);
}
