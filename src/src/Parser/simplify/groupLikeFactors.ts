import { ASTNode } from "../ASTNode";
import { extractExponent } from "./extractExponent";

// 同じ底の因子をグループ化
export function groupLikeFactors(
  factors: ASTNode[]
): Map<string, { exponent: number; base: ASTNode }> {
  const groups = new Map<string, { exponent: number; base: ASTNode }>();

  for (const factor of factors) {
    const { exponent, base } = extractExponent(factor);

    // baseを正規化して、より確実な比較を行う
    const baseKey = normalizeBaseKey(base);

    const existing = groups.get(baseKey);
    if (existing) {
      existing.exponent += exponent;
    } else {
      groups.set(baseKey, { exponent, base });
    }
  }

  return groups;
}

// 底を正規化してキーを生成
function normalizeBaseKey(base: ASTNode): string {
  if (base.type === "number") {
    return `num:${base.value}`;
  } else if (base.type === "symbol") {
    return `sym:${base.name}`;
  } else if (base.type === "operator") {
    const leftKey = normalizeBaseKey(base.left);
    const rightKey = normalizeBaseKey(base.right);

    // 加算と乗算は可換なので、順序を正規化
    if (base.op === "+" || base.op === "*") {
      const [first, second] = [leftKey, rightKey].sort();
      return `op:${base.op}:${first}:${second}`;
    }

    return `op:${base.op}:${leftKey}:${rightKey}`;
  } else if (base.type === "function") {
    const argsKey = base.args.map(normalizeBaseKey).join(",");
    return `func:${base.name}:${argsKey}`;
  }

  // フォールバック
  return `unknown:${JSON.stringify(base)}`;
}
