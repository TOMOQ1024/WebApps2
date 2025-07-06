import { ASTNode } from "../ASTNode";
import { extractCoefficient } from "./extractCoefficient";

// ASTノードを正規化されたキーに変換
function normalizeASTKey(node: ASTNode): string {
  if (node.type === "number") {
    return `num:${node.value}`;
  } else if (node.type === "symbol") {
    return `sym:${node.name}`;
  } else if (node.type === "operator") {
    const leftKey = normalizeASTKey(node.left);
    const rightKey = normalizeASTKey(node.right);

    // 加算と乗算は可換なので、順序を正規化
    if (node.op === "+" || node.op === "*") {
      const [first, second] = [leftKey, rightKey].sort();
      return `op:${node.op}:${first}:${second}`;
    }

    return `op:${node.op}:${leftKey}:${rightKey}`;
  } else if (node.type === "function") {
    const argsKey = node.args.map(normalizeASTKey).join(",");
    return `func:${node.name}:${argsKey}`;
  }

  // フォールバック - より安定したキー生成
  return `unknown:${JSON.stringify(node)}`;
}

// 同類項をグループ化
export function groupLikeTerms(
  terms: ASTNode[]
): Map<string, { coefficient: number; base: ASTNode }> {
  const groups = new Map<string, { coefficient: number; base: ASTNode }>();

  for (const term of terms) {
    const { coefficient, base } = extractCoefficient(term);

    // 正規化されたキーを使用
    const baseKey = normalizeASTKey(base);

    const existing = groups.get(baseKey);
    if (existing) {
      existing.coefficient += coefficient;
    } else {
      groups.set(baseKey, { coefficient, base });
    }
  }

  return groups;
}
