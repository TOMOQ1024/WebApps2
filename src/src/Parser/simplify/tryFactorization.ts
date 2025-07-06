import { ASTNode } from "../ASTNode";
import { flattenAddition } from "./flattenAddition";
import { extractCoefficient } from "./extractCoefficient";

// ASTノードが深く等しいかチェック
function deepEqual(a: ASTNode, b: ASTNode): boolean {
  if (a.type !== b.type) return false;

  if (a.type === "number") {
    return a.value === (b as any).value;
  } else if (a.type === "symbol") {
    return a.name === (b as any).name;
  } else if (a.type === "operator") {
    const bOp = b as any;
    return (
      a.op === bOp.op &&
      deepEqual(a.left, bOp.left) &&
      deepEqual(a.right, bOp.right)
    );
  } else if (a.type === "function") {
    const bFunc = b as any;
    return (
      a.name === bFunc.name &&
      a.args.length === bFunc.args.length &&
      a.args.every((arg, i) => deepEqual(arg, bFunc.args[i]))
    );
  }

  return false;
}

// ASTノードを文字列化（比較用）
function astToString(node: ASTNode): string {
  if (node.type === "number") {
    return node.value.toString();
  } else if (node.type === "symbol") {
    return node.name;
  } else if (node.type === "operator") {
    return `(${astToString(node.left)}${node.op}${astToString(node.right)})`;
  } else if (node.type === "function") {
    return `${node.name}(${node.args.map(astToString).join(",")})`;
  }
  return "";
}

// 複合式内で共通因子を抽出
function extractCommonFactor(terms: ASTNode[]): {
  commonFactor: ASTNode | null;
  factorizedTerms: ASTNode[];
} {
  // より高度な因数分解: AB + AC + DB + DC = (A+D)(B+C) のパターンを検出
  if (terms.length === 4) {
    // 4項の場合の特別処理: AB + AC + DB + DC = (A+D)(B+C)
    const result = tryFactorize4Terms(terms);
    if (result) return result;
  }

  // 各項を分析して、乗算の形を展開
  const expandedTerms: { factor: ASTNode; coefficient: ASTNode | null }[] = [];

  for (const term of terms) {
    if (term.type === "operator" && term.op === "*") {
      // A * B の形を分析
      const left = term.left;
      const right = term.right;

      if (left.type === "number") {
        // 数値 * 式 の形
        expandedTerms.push({ factor: right, coefficient: left });
      } else if (right.type === "number") {
        // 式 * 数値 の形
        expandedTerms.push({ factor: left, coefficient: right });
      } else {
        // 両方とも式の場合、展開を試みる
        // (A+B)*C の形かチェック
        if (left.type === "operator" && left.op === "+") {
          // (A+B)*C → A*C + B*C として扱う
          expandedTerms.push({ factor: right, coefficient: left });
        } else {
          // そのまま1つの因子として扱う
          expandedTerms.push({ factor: term, coefficient: null });
        }
      }
    } else {
      // 単独の項（係数1として扱う）
      expandedTerms.push({
        factor: term,
        coefficient: { type: "number", value: 1 },
      });
    }
  }

  // 因子ごとにグループ化
  const factorGroups = new Map<
    string,
    { factor: ASTNode; coefficients: ASTNode[] }
  >();

  for (const { factor, coefficient } of expandedTerms) {
    const factorKey = astToString(factor);

    if (factorGroups.has(factorKey)) {
      if (coefficient) {
        factorGroups.get(factorKey)!.coefficients.push(coefficient);
      }
    } else {
      factorGroups.set(factorKey, {
        factor,
        coefficients: coefficient ? [coefficient] : [],
      });
    }
  }

  // 複数回現れる因子を探す
  for (const [factorKey, { factor, coefficients }] of factorGroups.entries()) {
    if (coefficients.length > 1) {
      // 係数を合計
      const sumCoefficients = coefficients.reduce(
        (sum, coeff) => {
          if (sum.type === "number" && coeff.type === "number") {
            return { type: "number", value: sum.value + coeff.value };
          } else if (sum.type === "number" && sum.value === 0) {
            return coeff;
          } else if (coeff.type === "number" && coeff.value === 0) {
            return sum;
          } else {
            return {
              type: "operator",
              op: "+",
              left: sum,
              right: coeff,
            };
          }
        },
        { type: "number", value: 0 } as ASTNode
      );

      // 他の項を収集
      const otherTerms: ASTNode[] = [];
      for (const [
        otherKey,
        { factor: otherFactor },
      ] of factorGroups.entries()) {
        if (otherKey !== factorKey) {
          otherTerms.push(otherFactor);
        }
      }

      // 因数分解された形を作成
      if (sumCoefficients.type === "number" && sumCoefficients.value === 1) {
        if (otherTerms.length === 0) {
          return {
            commonFactor: factor,
            factorizedTerms: [{ type: "number", value: 1 }],
          };
        } else {
          return {
            commonFactor: factor,
            factorizedTerms: [{ type: "number", value: 1 }, ...otherTerms],
          };
        }
      } else {
        if (otherTerms.length === 0) {
          return { commonFactor: factor, factorizedTerms: [sumCoefficients] };
        } else {
          return {
            commonFactor: factor,
            factorizedTerms: [sumCoefficients, ...otherTerms],
          };
        }
      }
    }
  }

  return { commonFactor: null, factorizedTerms: terms };
}

// 4項の因数分解を試行: AB + AC + DB + DC = (A+D)(B+C)
function tryFactorize4Terms(terms: ASTNode[]): {
  commonFactor: ASTNode | null;
  factorizedTerms: ASTNode[];
} | null {
  // 各項を A*B の形に分解
  const factorPairs: { left: ASTNode; right: ASTNode }[] = [];

  for (const term of terms) {
    if (term.type === "operator" && term.op === "*") {
      factorPairs.push({ left: term.left, right: term.right });
    } else {
      // 単項は 1 * term として扱う
      factorPairs.push({ left: { type: "number", value: 1 }, right: term });
    }
  }

  if (factorPairs.length !== 4) return null;

  // すべての可能な因数分解パターンを試行
  // パターン1: (0+2)(1+3) - 第1と第3項、第2と第4項をグループ
  const pattern1 = tryFactorizationPattern(
    [factorPairs[0], factorPairs[2]],
    [factorPairs[1], factorPairs[3]]
  );
  if (pattern1) return pattern1;

  // パターン2: (0+1)(2+3) - 第1と第2項、第3と第4項をグループ
  const pattern2 = tryFactorizationPattern(
    [factorPairs[0], factorPairs[1]],
    [factorPairs[2], factorPairs[3]]
  );
  if (pattern2) return pattern2;

  // パターン3: (0+3)(1+2) - 第1と第4項、第2と第3項をグループ
  const pattern3 = tryFactorizationPattern(
    [factorPairs[0], factorPairs[3]],
    [factorPairs[1], factorPairs[2]]
  );
  if (pattern3) return pattern3;

  return null;
}

// 特定のパターンで因数分解を試行
function tryFactorizationPattern(
  group1: { left: ASTNode; right: ASTNode }[],
  group2: { left: ASTNode; right: ASTNode }[]
): {
  commonFactor: ASTNode | null;
  factorizedTerms: ASTNode[];
} | null {
  if (group1.length !== 2 || group2.length !== 2) return null;

  // パターン: A*B + A*C + D*B + D*C = (A+D)*(B+C)
  // group1[0] = A*B, group1[1] = D*B
  // group2[0] = A*C, group2[1] = D*C

  const AB_left = astToString(group1[0].left); // A
  const AB_right = astToString(group1[0].right); // B
  const DB_left = astToString(group1[1].left); // D
  const DB_right = astToString(group1[1].right); // B

  const AC_left = astToString(group2[0].left); // A
  const AC_right = astToString(group2[0].right); // C
  const DC_left = astToString(group2[1].left); // D
  const DC_right = astToString(group2[1].right); // C

  // A と D が交差してマッチし、B と C が交差してマッチするかチェック
  if (
    AB_left === AC_left &&
    DB_left === DC_left &&
    AB_right === DB_right &&
    AC_right === DC_right
  ) {
    // (A + D) * (B + C) のパターン発見
    const factor1 = {
      type: "operator",
      op: "+",
      left: group1[0].left, // A
      right: group1[1].left, // D
    } as ASTNode;

    const factor2 = {
      type: "operator",
      op: "+",
      left: group1[0].right, // B
      right: group2[0].right, // C
    } as ASTNode;

    return {
      commonFactor: factor2,
      factorizedTerms: [factor1],
    };
  }

  return null;
}

// 簡単な因数分解を試行
export function tryFactorization(node: ASTNode): ASTNode {
  if (node.type !== "operator" || node.op !== "+") return node;

  const terms = flattenAddition(node.left, node.right);

  // 特殊パターンの検出: (A*F + F) → (A+1)*F
  // 例: (9+tan x)(π^x+sin x) + π^x+sin x → (10+tan x)(π^x+sin x)
  for (let i = 0; i < terms.length; i++) {
    for (let j = i + 1; j < terms.length; j++) {
      const term1 = terms[i];
      const term2 = terms[j];

      // term1 が A*F の形で、term2 が F の形かチェック
      if (term1.type === "operator" && term1.op === "*") {
        const A = term1.left;
        const F = term1.right;

        if (deepEqual(F, term2)) {
          // A*F + F → (A+1)*F に変換
          const newCoefficient = {
            type: "operator",
            op: "+",
            left: A,
            right: { type: "number", value: 1 },
          } as ASTNode;

          const newTerm = {
            type: "operator",
            op: "*",
            left: newCoefficient,
            right: F,
          } as ASTNode;

          // 他の項を収集
          const remainingTerms = terms.filter(
            (_, index) => index !== i && index !== j
          );

          if (remainingTerms.length === 0) {
            return newTerm;
          } else {
            const combinedRemaining = remainingTerms.reduce((a, b) => ({
              type: "operator",
              op: "+",
              left: a,
              right: b,
            }));
            return {
              type: "operator",
              op: "+",
              left: newTerm,
              right: combinedRemaining,
            };
          }
        }
      }

      // term2 が A*F の形で、term1 が F の形かチェック
      if (term2.type === "operator" && term2.op === "*") {
        const A = term2.left;
        const F = term2.right;

        if (deepEqual(F, term1)) {
          // F + A*F → (1+A)*F に変換
          const newCoefficient = {
            type: "operator",
            op: "+",
            left: { type: "number", value: 1 },
            right: A,
          } as ASTNode;

          const newTerm = {
            type: "operator",
            op: "*",
            left: newCoefficient,
            right: F,
          } as ASTNode;

          // 他の項を収集
          const remainingTerms = terms.filter(
            (_, index) => index !== i && index !== j
          );

          if (remainingTerms.length === 0) {
            return newTerm;
          } else {
            const combinedRemaining = remainingTerms.reduce((a, b) => ({
              type: "operator",
              op: "+",
              left: a,
              right: b,
            }));
            return {
              type: "operator",
              op: "+",
              left: newTerm,
              right: combinedRemaining,
            };
          }
        }
      }
    }
  }

  // 複合式の共通因子抽出を試行
  const { commonFactor, factorizedTerms } = extractCommonFactor(terms);

  if (commonFactor && factorizedTerms.length > 0) {
    if (factorizedTerms.length === 1) {
      if (
        factorizedTerms[0].type === "number" &&
        factorizedTerms[0].value === 1
      ) {
        return commonFactor;
      } else {
        return {
          type: "operator",
          op: "*",
          left: factorizedTerms[0],
          right: commonFactor,
        };
      }
    } else {
      const combinedTerms = factorizedTerms.reduce((a, b) => ({
        type: "operator",
        op: "+",
        left: a,
        right: b,
      }));
      return {
        type: "operator",
        op: "*",
        left: combinedTerms,
        right: commonFactor,
      };
    }
  }

  // x^2 + x → x(x + 1) のような簡単なケース
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
