import { ASTNode } from "../ASTNode";

// ASTの簡約化（統一的なアプローチ）
export function simplifyAST(node: ASTNode): ASTNode {
  // まず正規化を行う
  const normalized = normalizeAST(node);

  // 正規化されたASTを簡約化
  const simplified = simplifyNormalizedAST(normalized);

  // 必要に応じて元の形式に戻す
  return denormalizeAST(simplified);
}

// ASTを正規化する（a-b → a+(-b), a/b → a*(b^(-1))）
function normalizeAST(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    // 乗算で係数と複合式の組み合わせの場合は特別扱い
    if (
      node.op === "*" &&
      node.left.type === "number" &&
      node.right.type === "operator" &&
      (node.right.op === "+" || node.right.op === "-")
    ) {
      // 係数と複合式の乗算は正規化せずにそのまま保持
      return {
        type: "operator",
        op: "*",
        left: node.left,
        right: normalizeAST(node.right),
      };
    }

    const left = normalizeAST(node.left);
    const right = normalizeAST(node.right);

    switch (node.op) {
      case "-":
        // a - b → a + (-b)
        return {
          type: "operator",
          op: "+",
          left: left,
          right: {
            type: "operator",
            op: "*",
            left: { type: "number", value: -1 },
            right: right,
          },
        };

      case "/":
        // a / b → a * (b^(-1))
        return {
          type: "operator",
          op: "*",
          left: left,
          right: {
            type: "operator",
            op: "^",
            left: right,
            right: { type: "number", value: -1 },
          },
        };

      default:
        return { ...node, left, right };
    }
  } else if (node.type === "function") {
    return { ...node, args: node.args.map(normalizeAST) };
  }

  return node;
}

// 正規化されたASTを簡約化
function simplifyNormalizedAST(node: ASTNode): ASTNode {
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

// 加算の簡約化
function simplifyAddition(left: ASTNode, right: ASTNode): ASTNode {
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

// 乗算の簡約化
function simplifyMultiplication(left: ASTNode, right: ASTNode): ASTNode {
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

// べき乗の簡約化
function simplifyPower(base: ASTNode, exponent: ASTNode): ASTNode {
  // a^0 → 1
  if (isZero(exponent)) return { type: "number", value: 1 };

  // a^1 → a
  if (isOne(exponent)) return base;

  // (a^b)^c → a^(b*c)
  if (
    base.type === "operator" &&
    base.op === "^" &&
    base.right.type === "number" &&
    exponent.type === "number"
  ) {
    return {
      type: "operator",
      op: "^",
      left: base.left,
      right: { type: "number", value: base.right.value * exponent.value },
    };
  }

  // 数値の場合は計算
  if (base.type === "number" && exponent.type === "number") {
    return { type: "number", value: Math.pow(base.value, exponent.value) };
  }

  return { type: "operator", op: "^", left: base, right: exponent };
}

// 加算項を平坦化
function flattenAddition(left: ASTNode, right: ASTNode): ASTNode[] {
  const terms: ASTNode[] = [];

  const collect = (node: ASTNode) => {
    if (node.type === "operator" && node.op === "+") {
      collect(node.left);
      collect(node.right);
    } else {
      terms.push(node);
    }
  };

  collect(left);
  collect(right);

  return terms;
}

// 乗算項を平坦化
function flattenMultiplication(left: ASTNode, right: ASTNode): ASTNode[] {
  const factors: ASTNode[] = [];

  const collect = (node: ASTNode) => {
    if (node.type === "operator" && node.op === "*") {
      collect(node.left);
      collect(node.right);
    } else {
      factors.push(node);
    }
  };

  collect(left);
  collect(right);

  return factors;
}

// 同類項をグループ化
function groupLikeTerms(
  terms: ASTNode[]
): Map<string, { coefficient: number; base: ASTNode }> {
  const groups = new Map<string, { coefficient: number; base: ASTNode }>();

  for (const term of terms) {
    const { coefficient, base } = extractCoefficient(term);
    const baseKey = JSON.stringify(base);

    const existing = groups.get(baseKey);
    if (existing) {
      existing.coefficient += coefficient;
    } else {
      groups.set(baseKey, { coefficient, base });
    }
  }

  return groups;
}

// 同じ底の因子をグループ化
function groupLikeFactors(
  factors: ASTNode[]
): Map<string, { exponent: number; base: ASTNode }> {
  const groups = new Map<string, { exponent: number; base: ASTNode }>();

  for (const factor of factors) {
    const { exponent, base } = extractExponent(factor);
    const baseKey = JSON.stringify(base);

    const existing = groups.get(baseKey);
    if (existing) {
      existing.exponent += exponent;
    } else {
      groups.set(baseKey, { exponent, base });
    }
  }

  return groups;
}

// 項から係数と基底を抽出
function extractCoefficient(term: ASTNode): {
  coefficient: number;
  base: ASTNode;
} {
  if (term.type === "number") {
    return { coefficient: term.value, base: { type: "number", value: 1 } };
  }

  // 乗算の場合、数値因子と非数値因子に分ける
  if (term.type === "operator" && term.op === "*") {
    const factors = flattenMultiplication(term.left, term.right);
    let coefficient = 1;
    const nonNumericFactors: ASTNode[] = [];

    for (const factor of factors) {
      if (factor.type === "number") {
        coefficient *= factor.value;
      } else {
        nonNumericFactors.push(factor);
      }
    }

    const base =
      nonNumericFactors.length === 0
        ? { type: "number" as const, value: 1 }
        : nonNumericFactors.length === 1
        ? nonNumericFactors[0]
        : nonNumericFactors.reduce((a, b) => ({
            type: "operator" as const,
            op: "*",
            left: a,
            right: b,
          }));

    return { coefficient, base };
  }

  // 負の係数の処理: (-1) * expr
  if (
    term.type === "operator" &&
    term.op === "*" &&
    term.left.type === "number" &&
    term.left.value === -1
  ) {
    return { coefficient: -1, base: term.right };
  }

  // その他の場合は係数1、基底は項そのもの
  return { coefficient: 1, base: term };
}

// 因子から指数と基底を抽出
function extractExponent(factor: ASTNode): { exponent: number; base: ASTNode } {
  if (
    factor.type === "operator" &&
    factor.op === "^" &&
    factor.right.type === "number"
  ) {
    return { exponent: factor.right.value, base: factor.left };
  }

  return { exponent: 1, base: factor };
}

// 加算を構築
function buildAddition(
  groups: Map<string, { coefficient: number; base: ASTNode }>
): ASTNode {
  const terms: ASTNode[] = [];

  for (const { coefficient, base } of groups.values()) {
    if (coefficient === 0) continue;

    if (base.type === "number" && base.value === 1) {
      // 定数項
      terms.push({ type: "number", value: coefficient });
    } else if (coefficient === 1) {
      terms.push(base);
    } else if (coefficient === -1) {
      terms.push({
        type: "operator",
        op: "*",
        left: { type: "number", value: -1 },
        right: base,
      });
    } else {
      terms.push({
        type: "operator",
        op: "*",
        left: { type: "number", value: coefficient },
        right: base,
      });
    }
  }

  if (terms.length === 0) {
    return { type: "number", value: 0 };
  } else if (terms.length === 1) {
    return terms[0];
  } else {
    const result = terms.reduce((a, b) => ({
      type: "operator",
      op: "+",
      left: a,
      right: b,
    }));

    // 簡単な因数分解を試行
    return tryFactorization(result);
  }
}

// 簡単な因数分解を試行
function tryFactorization(node: ASTNode): ASTNode {
  if (node.type !== "operator" || node.op !== "+") return node;

  // x^2 + x → x(x + 1) のような簡単なケース
  const terms = flattenAddition(node.left, node.right);

  // 変数xの項を探す
  const xTerms: { coefficient: number; exponent: number }[] = [];
  const otherTerms: ASTNode[] = [];

  for (const term of terms) {
    const { coefficient, base } = extractCoefficient(term);

    if (base.type === "symbol" && base.name === "x") {
      xTerms.push({ coefficient, exponent: 1 });
    } else if (
      base.type === "operator" &&
      base.op === "^" &&
      base.left.type === "symbol" &&
      base.left.name === "x" &&
      base.right.type === "number"
    ) {
      xTerms.push({ coefficient, exponent: base.right.value });
    } else {
      otherTerms.push(term);
    }
  }

  // x^2 + x の場合
  if (xTerms.length === 2 && otherTerms.length === 0) {
    const sorted = xTerms.sort((a, b) => b.exponent - a.exponent);
    if (
      sorted[0].exponent === 2 &&
      sorted[1].exponent === 1 &&
      sorted[0].coefficient === 1 &&
      sorted[1].coefficient === 1
    ) {
      return {
        type: "operator",
        op: "*",
        left: { type: "symbol", name: "x" },
        right: {
          type: "operator",
          op: "+",
          left: { type: "symbol", name: "x" },
          right: { type: "number", value: 1 },
        },
      };
    }
  }

  return node;
}

// 乗算を構築
function buildMultiplication(
  groups: Map<string, { exponent: number; base: ASTNode }>
): ASTNode {
  const factors: ASTNode[] = [];

  for (const { exponent, base } of groups.values()) {
    if (exponent === 0) continue;

    if (exponent === 1) {
      factors.push(base);
    } else {
      factors.push({
        type: "operator",
        op: "^",
        left: base,
        right: { type: "number", value: exponent },
      });
    }
  }

  if (factors.length === 0) {
    return { type: "number", value: 1 };
  } else if (factors.length === 1) {
    return factors[0];
  } else {
    return factors.reduce((a, b) => ({
      type: "operator",
      op: "*",
      left: a,
      right: b,
    }));
  }
}

// 正規化されたASTを元の形式に戻す
function denormalizeAST(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    const left = denormalizeAST(node.left);
    const right = denormalizeAST(node.right);

    // (-1) * a → -a に変換
    if (node.op === "*" && left.type === "number" && left.value === -1) {
      return {
        type: "operator",
        op: "-",
        left: { type: "number", value: 0 },
        right: right,
      };
    }

    // a * (b^(-1)) → a / b に変換
    if (
      node.op === "*" &&
      right.type === "operator" &&
      right.op === "^" &&
      right.right.type === "number" &&
      right.right.value === -1
    ) {
      return {
        type: "operator",
        op: "/",
        left: left,
        right: right.left,
      };
    }

    // 乗算の中で負の指数を持つ因子を分数に変換
    if (node.op === "*") {
      const factors = flattenMultiplication(left, right);
      const positiveFactors: ASTNode[] = [];
      const negativeFactors: ASTNode[] = [];

      for (const factor of factors) {
        if (
          factor.type === "operator" &&
          factor.op === "^" &&
          factor.right.type === "number" &&
          factor.right.value < 0
        ) {
          // 負の指数を正の指数に変換して分母に移動
          negativeFactors.push({
            type: "operator",
            op: "^",
            left: factor.left,
            right: { type: "number", value: -factor.right.value },
          });
        } else {
          positiveFactors.push(factor);
        }
      }

      // 分数形式に変換
      if (negativeFactors.length > 0) {
        const numerator =
          positiveFactors.length === 0
            ? { type: "number" as const, value: 1 }
            : positiveFactors.length === 1
            ? positiveFactors[0]
            : positiveFactors.reduce((a, b) => ({
                type: "operator" as const,
                op: "*",
                left: a,
                right: b,
              }));

        const denominator =
          negativeFactors.length === 1
            ? negativeFactors[0]
            : negativeFactors.reduce((a, b) => ({
                type: "operator" as const,
                op: "*",
                left: a,
                right: b,
              }));

        return {
          type: "operator" as const,
          op: "/",
          left: numerator,
          right: denominator,
        };
      }
    }

    return { ...node, left, right };
  } else if (node.type === "function") {
    return { ...node, args: node.args.map(denormalizeAST) };
  }

  return node;
}

// ヘルパー関数
function isZero(node: ASTNode): boolean {
  return node.type === "number" && node.value === 0;
}

function isOne(node: ASTNode): boolean {
  return node.type === "number" && node.value === 1;
}

// 数値演算の評価
function evaluateNumericOps(node: ASTNode): ASTNode | null {
  if (node.type !== "operator") return null;
  const { op, left, right } = node;

  if (left.type === "number" && right.type === "number") {
    switch (op) {
      case "+":
        return { type: "number", value: left.value + right.value };
      case "*":
        return { type: "number", value: left.value * right.value };
      case "^":
        // 分数の指数の場合は評価しない（分数形式を保持）
        if (right.value < 0 || !Number.isInteger(right.value)) {
          return null;
        }
        return { type: "number", value: Math.pow(left.value, right.value) };
    }
  }

  return null;
}

// 最大公約数を求める
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// 分数を約分する
function simplifyFraction(
  numerator: number,
  denominator: number
): { num: number; den: number } {
  if (denominator === 0) return { num: numerator, den: denominator };

  const divisor = gcd(numerator, denominator);
  let num = numerator / divisor;
  let den = denominator / divisor;

  // 分母が負の場合は符号を分子に移動
  if (den < 0) {
    num = -num;
    den = -den;
  }

  return { num, den };
}
