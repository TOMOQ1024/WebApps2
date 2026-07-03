import { ASTNode } from "../ASTNode";
import { extractExponent } from "./extractExponent";

function primeFactorize(n: number): Array<{ prime: number; power: number }> {
  const factors: Array<{ prime: number; power: number }> = [];
  let temp = n;

  for (let i = 2; i * i <= temp; i++) {
    let count = 0;
    while (temp % i === 0) {
      temp /= i;
      count++;
    }
    if (count > 0) {
      factors.push({ prime: i, power: count });
    }
  }

  if (temp > 1) {
    factors.push({ prime: temp, power: 1 });
  }

  return factors;
}

function expandNumericFactor(
  factor: ASTNode,
): Array<{ exponent: number; base: ASTNode }> {
  const { exponent, base } = extractExponent(factor);

  if (
    exponent <= 0 ||
    base.type !== "number" ||
    !Number.isInteger(base.value)
  ) {
    return [{ exponent, base }];
  }

  const value = base.value;
  if (value === 0 || value === 1 || value === -1) {
    return [{ exponent, base }];
  }

  const sign = value < 0 ? -1 : 1;
  const primeFactors = primeFactorize(Math.abs(value));

  if (primeFactors.length === 0) {
    return [{ exponent, base }];
  }

  const expanded = primeFactors.map(({ prime, power }) => ({
    exponent: power * exponent,
    base: { type: "number" as const, value: prime },
  }));

  if (sign < 0) {
    expanded.unshift({
      exponent: 1,
      base: { type: "number" as const, value: -1 },
    });
  }

  return expanded;
}

function addToGroup(
  groups: Map<string, { exponent: number; base: ASTNode }>,
  exponent: number,
  base: ASTNode,
): void {
  const baseKey = normalizeBaseKey(base);
  const existing = groups.get(baseKey);

  if (existing) {
    existing.exponent += exponent;
  } else {
    groups.set(baseKey, { exponent, base });
  }
}

function isNumericFactor(factor: ASTNode): boolean {
  return extractExponent(factor).base.type === "number";
}

// 同じ底の因子をグループ化
export function groupLikeFactors(
  factors: ASTNode[],
): Map<string, { exponent: number; base: ASTNode }> {
  const groups = new Map<string, { exponent: number; base: ASTNode }>();
  const expandNumeric = factors.length > 0 && factors.every(isNumericFactor);

  for (const factor of factors) {
    const expanded = expandNumeric
      ? expandNumericFactor(factor)
      : [extractExponent(factor)];

    for (const { exponent, base } of expanded) {
      addToGroup(groups, exponent, base);
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
