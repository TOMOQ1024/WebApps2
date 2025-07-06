import { ASTNode } from "../ASTNode";
import { normalizeAST } from "./normalizeAST";
import { simplifyNormalizedAST } from "./simplifyNormalizedAST";
import { denormalizeAST } from "./denormalizeAST";

// ASTの簡約化（統一的なアプローチ）
export function simplifyAST(node: ASTNode): ASTNode {
  // まず正規化を行う
  const normalized = normalizeAST(node);

  // 正規化されたASTを簡約化
  const simplified = simplifyNormalizedAST(normalized);

  // 必要に応じて元の形式に戻す
  return denormalizeAST(simplified);
}
