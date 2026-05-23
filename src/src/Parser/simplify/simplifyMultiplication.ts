import { ASTNode } from "../ASTNode";
import { isZero, isOne } from "./helpers";
import { flattenMultiplication } from "./flattenMultiplication";
import { groupLikeFactors } from "./groupLikeFactors";
import { buildMultiplication } from "./buildMultiplication";
import { flattenAddition } from "./flattenAddition";
import { extractCoefficient } from "./extractCoefficient";

// ASTノードが等しいかチェック
function astEqual(a: ASTNode, b: ASTNode): boolean {
  if (a.type !== b.type) return false;

  if (a.type === "number") {
    return a.value === (b as any).value;
  } else if (a.type === "symbol") {
    return a.name === (b as any).name;
  } else if (a.type === "operator") {
    const bOp = b as any;
    return (
      a.op === bOp.op &&
      astEqual(a.left, bOp.left) &&
      astEqual(a.right, bOp.right)
    );
  } else if (a.type === "function") {
    const bFunc = b as any;
    return (
      a.name === bFunc.name &&
      a.args.length === bFunc.args.length &&
      a.args.every((arg, i) => astEqual(arg, bFunc.args[i]))
    );
  }

  return false;
}

// 単項を分母で割る処理
function simpleTermDivision(
  term: ASTNode,
  denominator: ASTNode
): ASTNode | null {
  // term と denominator を係数と基底に分解
  const { coefficient: termCoeff, base: termBase } = extractCoefficient(term);
  const { coefficient: denCoeff, base: denBase } =
    extractCoefficient(denominator);

  // 数値係数の約分
  if (denCoeff === 0) {
    return null;
  }

  const coeffResult = termCoeff / denCoeff;

  // 基底部分の約分
  let baseResult: ASTNode | null = null;

  // 基底が同じ場合 (例: x と x)
  if (astEqual(termBase, denBase)) {
    baseResult = { type: "number", value: 1 };
  }
  // term基底が x^2、分母基底が x の場合
  else if (
    termBase.type === "operator" &&
    termBase.op === "^" &&
    termBase.right.type === "number" &&
    astEqual(termBase.left, denBase)
  ) {
    const newExp = termBase.right.value - 1;
    if (newExp === 0) {
      baseResult = { type: "number", value: 1 };
    } else if (newExp === 1) {
      baseResult = termBase.left;
    } else {
      baseResult = {
        type: "operator",
        op: "^",
        left: termBase.left,
        right: { type: "number", value: newExp },
      };
    }
  }
  // term基底が x、分母基底が x^2 の場合
  else if (
    denBase.type === "operator" &&
    denBase.op === "^" &&
    denBase.right.type === "number" &&
    astEqual(termBase, denBase.left)
  ) {
    const newExp = 1 - denBase.right.value;
    if (newExp === 0) {
      baseResult = { type: "number", value: 1 };
    } else if (newExp < 0) {
      // 負の指数になる場合は約分しない
      return null;
    } else {
      baseResult = {
        type: "operator",
        op: "^",
        left: termBase,
        right: { type: "number", value: newExp },
      };
    }
  }
  // 基底が異なる場合は約分できない
  else {
    return null;
  }

  // 結果を構築
  if (baseResult.type === "number" && baseResult.value === 1) {
    // 基底が1の場合、係数のみ
    return { type: "number", value: coeffResult };
  } else {
    // 基底がある場合
    if (coeffResult === 1) {
      return baseResult;
    } else {
      return {
        type: "operator",
        op: "*",
        left: { type: "number", value: coeffResult },
        right: baseResult,
      };
    }
  }
}

// 乗算の簡約化
export function simplifyMultiplication(left: ASTNode, right: ASTNode): ASTNode {
  // 0 * a → 0, a * 0 → 0
  if (isZero(left) || isZero(right)) return { type: "number", value: 0 };

  // 1 * a → a, a * 1 → a
  if (isOne(left)) return right;
  if (isOne(right)) return left;

  // 乗算項を平坦化
  const factors = flattenMultiplication(left, right);

  // 因子を分類：加算式、正の指数、負の指数、数値
  let additionNode: ASTNode | null = null;
  const positiveFactors: ASTNode[] = [];
  const negativeExponentFactors: ASTNode[] = [];
  let coefficient = 1;

  for (const factor of factors) {
    if (factor.type === "number") {
      coefficient *= factor.value;
    } else if (factor.type === "operator" && factor.op === "+") {
      if (additionNode === null) {
        additionNode = factor;
      } else {
        positiveFactors.push(factor);
      }
    } else if (
      factor.type === "operator" &&
      factor.op === "^" &&
      factor.right.type === "number" &&
      factor.right.value < 0
    ) {
      negativeExponentFactors.push(factor);
    } else {
      positiveFactors.push(factor);
    }
  }

  // (係数 * 加算式) / (負の指数因子) のパターンを検出
  if (
    additionNode &&
    negativeExponentFactors.length > 0 &&
    positiveFactors.length === 0
  ) {
    // 分母を構築
    let denominator: ASTNode;
    if (negativeExponentFactors.length === 1) {
      const factor = negativeExponentFactors[0];
      if (
        factor.type === "operator" &&
        factor.op === "^" &&
        factor.right.type === "number" &&
        factor.right.value === -1
      ) {
        denominator = factor.left;
      } else if (
        factor.type === "operator" &&
        factor.op === "^" &&
        factor.right.type === "number"
      ) {
        denominator = {
          type: "operator" as const,
          op: "^" as const,
          left: factor.left,
          right: { type: "number" as const, value: -factor.right.value },
        };
      } else {
        // フォールバック
        denominator = factor;
      }
    } else {
      // 複数の負の指数因子がある場合は乗算で結合
      denominator = negativeExponentFactors.reduce((acc, factor) => {
        let positiveFactor: ASTNode;
        if (
          factor.type === "operator" &&
          factor.op === "^" &&
          factor.right.type === "number"
        ) {
          if (factor.right.value === -1) {
            positiveFactor = factor.left;
          } else {
            positiveFactor = {
              type: "operator" as const,
              op: "^" as const,
              left: factor.left,
              right: { type: "number" as const, value: -factor.right.value },
            };
          }
        } else {
          positiveFactor = factor;
        }

        return acc === null
          ? positiveFactor
          : {
              type: "operator" as const,
              op: "*" as const,
              left: acc,
              right: positiveFactor,
            };
      }, null as ASTNode | null) as ASTNode;
    }

    // 係数は分子と分母で個別に処理するため、ここでは分母に含めない

    // 加算の各項を分母で割る
    const numeratorTerms = flattenAddition(
      additionNode.left,
      additionNode.right
    );
    const simplifiedTerms: ASTNode[] = [];

    for (const term of numeratorTerms) {
      // 各項に係数を適用
      let termWithCoeff = term;
      if (coefficient !== 1) {
        termWithCoeff = {
          type: "operator" as const,
          op: "*" as const,
          left: { type: "number" as const, value: coefficient },
          right: term,
        };
      }

      const simplifiedTerm = simpleTermDivision(termWithCoeff, denominator);
      if (simplifiedTerm !== null) {
        simplifiedTerms.push(simplifiedTerm);
      } else {
        // 約分できない項がある場合は従来の処理に戻す
        break;
      }
    }

    if (simplifiedTerms.length === numeratorTerms.length) {
      // すべての項が約分できた場合
      const result = simplifiedTerms.reduce((a, b) => ({
        type: "operator",
        op: "+",
        left: a,
        right: b,
      }));
      return result;
    }
  }

  // 従来の処理に戻す

  // (加算式) * (1/分母) のパターンを検出して分配法則を適用
  if (
    left.type === "operator" &&
    left.op === "+" &&
    right.type === "operator" &&
    right.op === "/" &&
    right.left.type === "number" &&
    right.left.value === 1
  ) {
    // 加算の各項を分母で割る
    const numeratorTerms = flattenAddition(left.left, left.right);
    const denominator = right.right;
    const simplifiedTerms: ASTNode[] = [];

    for (const term of numeratorTerms) {
      const simplifiedTerm = simpleTermDivision(term, denominator);
      if (simplifiedTerm !== null) {
        simplifiedTerms.push(simplifiedTerm);
      } else {
        // 約分できない項がある場合は元の形に戻す
        break;
      }
    }

    if (simplifiedTerms.length === numeratorTerms.length) {
      // すべての項が約分できた場合
      const result = simplifiedTerms.reduce((a, b) => ({
        type: "operator",
        op: "+",
        left: a,
        right: b,
      }));

      return result;
    }
  }

  // 分数の約分処理
  if (
    left.type === "operator" &&
    left.op === "/" &&
    right.type === "operator" &&
    right.op === "^" &&
    right.right.type === "number" &&
    right.right.value === -1
  ) {
    // (a/b) * c^(-1) → a/(b*c)
    return {
      type: "operator",
      op: "/",
      left: left.left,
      right: {
        type: "operator",
        op: "*",
        left: left.right,
        right: right.left,
      },
    };
  }

  // 同じ底の指数をまとめる
  const grouped = groupLikeFactors(factors);

  // 結果を構築
  return buildMultiplication(grouped);
}
