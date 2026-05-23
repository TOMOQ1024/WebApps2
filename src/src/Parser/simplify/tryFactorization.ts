import { ASTNode } from "../ASTNode";
import { flattenAddition } from "./flattenAddition";
import { extractCoefficient } from "./extractCoefficient";
import { flattenMultiplication } from "./flattenMultiplication";

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

  // 乗算項を詳細に分析して共通因子を抽出
  // 例: x^2*z + x^3*y → x^2(z + x*y)
  const termFactorizations: { factors: ASTNode[]; originalTerm: ASTNode }[] =
    [];

  for (const term of terms) {
    if (term.type === "operator" && term.op === "*") {
      const factors = flattenMultiplication(term.left, term.right);
      termFactorizations.push({ factors, originalTerm: term });
    } else {
      termFactorizations.push({ factors: [term], originalTerm: term });
    }
  }

  // すべての項に共通するべき乗因子を探す（指数の最小値を使用）
  const baseExponents = new Map<string, number[]>();

  for (const { factors } of termFactorizations) {
    const currentBases = new Map<string, number>();

    for (const factor of factors) {
      if (
        factor.type === "operator" &&
        factor.op === "^" &&
        factor.left.type === "symbol" &&
        factor.right.type === "number"
      ) {
        const baseKey = factor.left.name;
        const exponent = factor.right.value;
        currentBases.set(baseKey, (currentBases.get(baseKey) || 0) + exponent);
      } else if (factor.type === "symbol") {
        const baseKey = factor.name;
        currentBases.set(baseKey, (currentBases.get(baseKey) || 0) + 1);
      }
    }

    // 各底の指数を記録
    for (const [baseKey, exponent] of currentBases) {
      if (!baseExponents.has(baseKey)) {
        baseExponents.set(baseKey, []);
      }
      baseExponents.get(baseKey)!.push(exponent);
    }
  }

  // 全ての項に存在する底を探し、最小指数を求める
  const commonFactorParts: ASTNode[] = [];
  for (const [baseKey, exponents] of baseExponents) {
    if (exponents.length === termFactorizations.length) {
      // すべての項にこの底が存在
      const minExponent = Math.min(...exponents);
      if (minExponent > 0) {
        if (minExponent === 1) {
          commonFactorParts.push({ type: "symbol", name: baseKey });
        } else {
          commonFactorParts.push({
            type: "operator",
            op: "^",
            left: { type: "symbol", name: baseKey },
            right: { type: "number", value: minExponent },
          });
        }
      }
    }
  }

  if (commonFactorParts.length > 0) {
    // 共通因子を構築
    const commonFactor =
      commonFactorParts.length === 1
        ? commonFactorParts[0]
        : commonFactorParts.reduce((a, b) => ({
            type: "operator" as const,
            op: "*" as const,
            left: a,
            right: b,
          }));

    // 各項から共通因子を除いた残りを計算
    const factorizedTerms: ASTNode[] = [];
    for (const { factors, originalTerm } of termFactorizations) {
      const remainingFactors: ASTNode[] = [];
      const usedExponents = new Map<string, number>();

      // 共通因子で使用された指数を記録
      for (const commonPart of commonFactorParts) {
        if (commonPart.type === "symbol") {
          usedExponents.set(commonPart.name, 1);
        } else if (
          commonPart.type === "operator" &&
          commonPart.op === "^" &&
          commonPart.left.type === "symbol" &&
          commonPart.right.type === "number"
        ) {
          usedExponents.set(commonPart.left.name, commonPart.right.value);
        }
      }

      // 各因子を処理
      const baseUsage = new Map<string, number>();
      for (const factor of factors) {
        if (
          factor.type === "operator" &&
          factor.op === "^" &&
          factor.left.type === "symbol" &&
          factor.right.type === "number"
        ) {
          const baseKey = factor.left.name;
          const exponent = factor.right.value;
          baseUsage.set(baseKey, (baseUsage.get(baseKey) || 0) + exponent);
        } else if (factor.type === "symbol") {
          const baseKey = factor.name;
          baseUsage.set(baseKey, (baseUsage.get(baseKey) || 0) + 1);
        } else {
          remainingFactors.push(factor);
        }
      }

      // 残りの指数を計算
      for (const [baseKey, totalExponent] of baseUsage) {
        const usedExponent = usedExponents.get(baseKey) || 0;
        const remainingExponent = totalExponent - usedExponent;

        if (remainingExponent > 0) {
          if (remainingExponent === 1) {
            remainingFactors.push({ type: "symbol", name: baseKey });
          } else {
            remainingFactors.push({
              type: "operator",
              op: "^",
              left: { type: "symbol", name: baseKey },
              right: { type: "number", value: remainingExponent },
            });
          }
        }
      }

      // 残りの因子から項を構築
      if (remainingFactors.length === 0) {
        factorizedTerms.push({ type: "number", value: 1 });
      } else if (remainingFactors.length === 1) {
        factorizedTerms.push(remainingFactors[0]);
      } else {
        const combinedFactor = remainingFactors.reduce((a, b) => ({
          type: "operator" as const,
          op: "*" as const,
          left: a,
          right: b,
        }));
        factorizedTerms.push(combinedFactor);
      }
    }

    return { commonFactor, factorizedTerms };
  }

  // 同じ底で異なる指数を持つ項から共通因子を抽出（従来の処理）
  // 例: A^5 + A^3 → A^3(A^2 + 1)
  const powerTerms = new Map<
    string,
    {
      base: ASTNode;
      terms: { exponent: number; coefficient: number; originalTerm: ASTNode }[];
    }
  >();
  const otherTerms: ASTNode[] = [];

  for (const term of terms) {
    // 係数と基底を抽出
    const { coefficient, base } = extractCoefficient(term);

    // 基底がべき乗の場合
    if (
      base.type === "operator" &&
      base.op === "^" &&
      base.right.type === "number"
    ) {
      const powerBase = base.left;
      const exponent = base.right.value;
      const baseKey = astToString(powerBase);

      if (!powerTerms.has(baseKey)) {
        powerTerms.set(baseKey, { base: powerBase, terms: [] });
      }
      powerTerms
        .get(baseKey)!
        .terms.push({ exponent, coefficient, originalTerm: term });
    }
    // 基底が単純な式の場合（指数1として扱う）
    else if (base.type !== "number" || base.value !== 1) {
      const baseKey = astToString(base);
      if (!powerTerms.has(baseKey)) {
        powerTerms.set(baseKey, { base, terms: [] });
      }
      powerTerms
        .get(baseKey)!
        .terms.push({ exponent: 1, coefficient, originalTerm: term });
    } else {
      otherTerms.push(term);
    }
  }

  // 複数の項を持つ底を探す
  for (const [baseKey, { base, terms: powerTermsList }] of Array.from(
    powerTerms.entries()
  )) {
    if (powerTermsList.length > 1) {
      // 最小指数を求める
      const minExponent = Math.min(...powerTermsList.map((t) => t.exponent));

      if (minExponent > 0) {
        // 共通因子を構築
        let commonFactor: ASTNode;
        if (minExponent === 1) {
          commonFactor = base;
        } else {
          commonFactor = {
            type: "operator",
            op: "^",
            left: base,
            right: { type: "number", value: minExponent },
          };
        }

        // 残りの項を構築
        const factorizedTerms: ASTNode[] = [];

        for (const { exponent, coefficient, originalTerm } of powerTermsList) {
          const remainingExponent = exponent - minExponent;

          let remainingTerm: ASTNode;
          if (remainingExponent === 0) {
            // 指数が0になる場合は係数のみ
            if (coefficient === 1) {
              remainingTerm = { type: "number", value: 1 };
            } else {
              remainingTerm = { type: "number", value: coefficient };
            }
          } else {
            // 残りの指数がある場合
            let baseTerm: ASTNode;
            if (remainingExponent === 1) {
              baseTerm = base;
            } else {
              baseTerm = {
                type: "operator",
                op: "^",
                left: base,
                right: { type: "number", value: remainingExponent },
              };
            }

            if (coefficient === 1) {
              remainingTerm = baseTerm;
            } else {
              remainingTerm = {
                type: "operator",
                op: "*",
                left: { type: "number", value: coefficient },
                right: baseTerm,
              };
            }
          }

          factorizedTerms.push(remainingTerm);
        }

        // 他の項も追加
        factorizedTerms.push(...otherTerms);

        // 他の底の項も追加
        for (const [
          otherKey,
          { base: otherBase, terms: otherTermsList },
        ] of Array.from(powerTerms.entries())) {
          if (otherKey !== baseKey) {
            factorizedTerms.push(...otherTermsList.map((t) => t.originalTerm));
          }
        }

        return { commonFactor, factorizedTerms };
      }
    }
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
  for (const [factorKey, { factor, coefficients }] of Array.from(
    factorGroups.entries()
  )) {
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
      for (const [otherKey, { factor: otherFactor }] of Array.from(
        factorGroups.entries()
      )) {
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

// 完全平方式の検出: a^2 + 2ab + b^2 = (a+b)^2
function tryQuadraticFactorization(terms: ASTNode[]): ASTNode | null {
  if (terms.length !== 3) return null;

  // 各項を解析して完全平方式のパターンを探す
  // 例: x^2 + 2x + 1 = (x+1)^2
  // 例: 1 + 2x + x^2 = (1+x)^2

  // まず各項を係数と基底に分解
  const termData = terms.map((term) => {
    const { coefficient, base } = extractCoefficient(term);
    return { coefficient, base, originalTerm: term };
  });

  // x^2項、x項、定数項を特定
  let squareTerm: {
    coefficient: number;
    base: ASTNode;
    variable: ASTNode;
  } | null = null;
  let linearTerm: { coefficient: number; variable: ASTNode } | null = null;
  let constantTerm: { coefficient: number } | null = null;

  for (const { coefficient, base } of termData) {
    if (
      base.type === "operator" &&
      base.op === "^" &&
      base.right.type === "number" &&
      base.right.value === 2
    ) {
      // x^2項
      squareTerm = { coefficient, base, variable: base.left };
    } else if (base.type === "symbol") {
      // x項
      linearTerm = { coefficient, variable: base };
    } else if (base.type === "number" && base.value === 1) {
      // 定数項
      constantTerm = { coefficient };
    }
  }

  // x^2 + 2x + 1 = (x+1)^2 の検出
  if (
    squareTerm &&
    linearTerm &&
    constantTerm &&
    squareTerm.coefficient === 1 &&
    deepEqual(squareTerm.variable, linearTerm.variable) &&
    linearTerm.coefficient === 2 &&
    constantTerm.coefficient === 1
  ) {
    return {
      type: "operator" as const,
      op: "^" as const,
      left: {
        type: "operator" as const,
        op: "+" as const,
        left: squareTerm.variable,
        right: { type: "number" as const, value: 1 },
      },
      right: { type: "number" as const, value: 2 },
    };
  }

  return null;
}

// 乗算項から共通因子を抽出
function extractCommonMultiplicativeFactors(terms: ASTNode[]): {
  commonFactor: ASTNode | null;
  factorizedTerms: ASTNode[];
} {
  if (terms.length < 2) return { commonFactor: null, factorizedTerms: terms };

  // 各項を乗算因子に分解
  const termFactors = terms.map((term) => {
    if (term.type === "operator" && term.op === "*") {
      return flattenMultiplication(term.left, term.right);
    } else {
      return [term];
    }
  });

  // すべての項に共通する因子を探す
  const firstTermFactors = termFactors[0];
  const commonFactors: ASTNode[] = [];

  for (const factor of firstTermFactors) {
    // この因子が他のすべての項にも存在するかチェック
    const existsInAllTerms = termFactors
      .slice(1)
      .every((otherTermFactors) =>
        otherTermFactors.some((otherFactor) => deepEqual(factor, otherFactor))
      );

    if (existsInAllTerms) {
      commonFactors.push(factor);
    }
  }

  if (commonFactors.length === 0) {
    return { commonFactor: null, factorizedTerms: terms };
  }

  // 共通因子を構築
  const commonFactor =
    commonFactors.length === 1
      ? commonFactors[0]
      : commonFactors.reduce((a, b) => ({
          type: "operator" as const,
          op: "*" as const,
          left: a,
          right: b,
        }));

  // 各項から共通因子を除いた残りの因子を計算
  const factorizedTerms = termFactors.map((factors) => {
    const remainingFactors = factors.filter(
      (factor) =>
        !commonFactors.some((commonFactor) => deepEqual(factor, commonFactor))
    );

    if (remainingFactors.length === 0) {
      return { type: "number" as const, value: 1 };
    } else if (remainingFactors.length === 1) {
      return remainingFactors[0];
    } else {
      return remainingFactors.reduce((a, b) => ({
        type: "operator" as const,
        op: "*" as const,
        left: a,
        right: b,
      }));
    }
  });

  return { commonFactor, factorizedTerms };
}

// 簡単な因数分解を試行
export function tryFactorization(node: ASTNode): ASTNode {
  if (node.type !== "operator" || node.op !== "+") return node;

  const terms = flattenAddition(node.left, node.right);

  // 完全平方式の検出: a^2 + 2ab + b^2 = (a+b)^2
  const quadraticResult = tryQuadraticFactorization(terms);
  if (quadraticResult) return quadraticResult;

  // 特殊パターンの検出: (A*F + F) → (A+1)*F を最初に実行
  // まず、乗算項の中で一部が他の項として独立して存在するケースを検出

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];

    // 乗算項をチェック
    if (term.type === "operator" && term.op === "*") {
      const A = term.left;
      const F = term.right;

      // F が加算項で、その構成要素が他の項として独立して存在するかチェック
      if (F.type === "operator" && F.op === "+") {
        const fComponents = flattenAddition(F.left, F.right);

        // fComponents のすべてが他の項として存在するかチェック
        const matchingIndices: number[] = [];
        let allComponentsFound = true;

        for (const component of fComponents) {
          const matchingIndex = terms.findIndex(
            (otherTerm, j) => j !== i && deepEqual(component, otherTerm)
          );

          if (matchingIndex !== -1) {
            matchingIndices.push(matchingIndex);
          } else {
            allComponentsFound = false;
            break;
          }
        }

        if (
          allComponentsFound &&
          matchingIndices.length === fComponents.length
        ) {
          // A*F + F のパターンを検出 → (A+1)*F に変換
          let newCoefficient: ASTNode;

          // A が加算項の場合、数値項を集約
          if (A.type === "operator" && A.op === "+") {
            const aTerms = flattenAddition(A.left, A.right);
            let numericSum = 1; // +1 を追加
            const nonNumericTerms: ASTNode[] = [];

            for (const aTerm of aTerms) {
              if (aTerm.type === "number") {
                numericSum += aTerm.value;
              } else {
                nonNumericTerms.push(aTerm);
              }
            }

            // 新しい係数を構築（数値項を後ろに配置）
            const terms: ASTNode[] = [];
            terms.push(...nonNumericTerms);
            if (numericSum !== 0) {
              terms.push({ type: "number", value: numericSum });
            }

            if (terms.length === 1) {
              newCoefficient = terms[0];
            } else {
              newCoefficient = terms.reduce((a, b) => ({
                type: "operator",
                op: "+",
                left: a,
                right: b,
              }));
            }
          } else {
            // A が単純な項の場合
            newCoefficient = {
              type: "operator",
              op: "+",
              left: A,
              right: { type: "number", value: 1 },
            } as ASTNode;
          }

          const newTerm = {
            type: "operator",
            op: "*",
            left: newCoefficient,
            right: F,
          } as ASTNode;

          // 使用された項以外の項を収集
          const usedIndices = [i, ...matchingIndices];
          const remainingTerms = terms.filter(
            (_, index) => !usedIndices.includes(index)
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

  // 複合式の共通因子抽出を試行（より高機能）
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

  // 乗算項から共通因子を抽出: fallback（シンプルなケース用）
  const multiplicativeResult = extractCommonMultiplicativeFactors(terms);
  if (multiplicativeResult.commonFactor) {
    const { commonFactor: mCommonFactor, factorizedTerms: mFactorizedTerms } =
      multiplicativeResult;

    if (mFactorizedTerms.length === 1) {
      if (
        mFactorizedTerms[0].type === "number" &&
        mFactorizedTerms[0].value === 1
      ) {
        return mCommonFactor;
      } else {
        return {
          type: "operator" as const,
          op: "*" as const,
          left: mFactorizedTerms[0],
          right: mCommonFactor,
        };
      }
    } else {
      const combinedTerms = mFactorizedTerms.reduce((a, b) => ({
        type: "operator" as const,
        op: "+" as const,
        left: a,
        right: b,
      }));
      return {
        type: "operator" as const,
        op: "*" as const,
        left: mCommonFactor,
        right: combinedTerms,
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
