import { ASTNode } from "../ASTNode";
import { isZero } from "./helpers";
import { flattenAddition } from "./flattenAddition";
import { groupLikeTerms } from "./groupLikeTerms";
import { buildAddition } from "./buildAddition";

// 加算の簡約化
export function simplifyAddition(left: ASTNode, right: ASTNode): ASTNode {
  // 0 + a → a, a + 0 → a
  if (isZero(left)) return right;
  if (isZero(right)) return left;

  // 加算項を平坦化
  const terms = flattenAddition(left, right);

  // 同類項をまとめる
  const grouped = groupLikeTerms(terms);

  // 結果を構築
  return buildAddition(grouped);
}
