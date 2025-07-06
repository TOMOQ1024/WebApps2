import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { evaluateNumericOps, simplifyFraction } from "./helpers";
import { simplifyAddition } from "./simplifyAddition";
import { simplifyMultiplication } from "./simplifyMultiplication";
import { simplifyPower } from "./simplifyPower";
import { flattenAddition } from "./flattenAddition";
import { flattenMultiplication } from "./flattenMultiplication";
import { extractCoefficient } from "./extractCoefficient";

// 正規化されたASTを簡約化
export function simplifyNormalizedAST(
  node: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  if (node.type === "operator") {
    // まず子ノードを再帰的に簡約化
    const left = simplifyNormalizedAST(node.left, options);
    const right = simplifyNormalizedAST(node.right, options);

    // 分数の約分処理
    if (node.op === "/") {
      // 数値同士の分数約分
      if (
        left.type === "number" &&
        right.type === "number" &&
        Number.isInteger(left.value) &&
        Number.isInteger(right.value)
      ) {
        const { num, den } = simplifyFraction(left.value, right.value);
        if (den === 1) {
          return { type: "number", value: num };
        } else {
          return {
            type: "operator",
            op: "/",
            left: { type: "number", value: num },
            right: { type: "number", value: den },
          };
        }
      }

      // 有理式の約分処理（rationalMode が fraction の場合）
      if (options?.rationalMode === "fraction") {
        const simplifiedRational = simplifyRationalExpression(left, right);
        if (simplifiedRational) {
          return simplifiedRational;
        }
      }
    }

    // 数値計算の評価
    const numericResult = evaluateNumericOps({ ...node, left, right }, options);
    if (numericResult) return numericResult;

    switch (node.op) {
      case "+":
        return simplifyAddition(left, right, options);
      case "*":
        return simplifyMultiplication(left, right);
      case "^":
        return simplifyPower(left, right, options);
      default:
        return { ...node, left, right };
    }
  } else if (node.type === "function") {
    return {
      ...node,
      args: node.args.map((arg) => simplifyNormalizedAST(arg, options)),
    };
  }

  return node;
}

// 有理式の約分処理
function simplifyRationalExpression(
  numerator: ASTNode,
  denominator: ASTNode
): ASTNode | null {
  // 分子が加算の場合、各項を分母で割る
  if (numerator.type === "operator" && numerator.op === "+") {
    const numeratorTerms = flattenAddition(numerator.left, numerator.right);
    const simplifiedTerms: ASTNode[] = [];

    for (const term of numeratorTerms) {
      const simplifiedTerm = simplifyRationalTerm(term, denominator);
      if (simplifiedTerm) {
        simplifiedTerms.push(simplifiedTerm);
      } else {
        // 約分できない項がある場合は全体として処理しない
        return null;
      }
    }

    if (simplifiedTerms.length === 0) {
      return { type: "number", value: 0 };
    } else if (simplifiedTerms.length === 1) {
      return simplifiedTerms[0];
    } else {
      return simplifiedTerms.reduce((a, b) => ({
        type: "operator",
        op: "+",
        left: a,
        right: b,
      }));
    }
  }

  // 分子が単項の場合
  return simplifyRationalTerm(numerator, denominator);
}

// 単一項の有理式約分
function simplifyRationalTerm(
  numeratorTerm: ASTNode,
  denominator: ASTNode
): ASTNode | null {
  // 数値同士の約分
  if (numeratorTerm.type === "number" && denominator.type === "number") {
    if (denominator.value === 0) return null;
    const { num, den } = simplifyFraction(
      numeratorTerm.value,
      denominator.value
    );
    if (den === 1) {
      return { type: "number", value: num };
    } else {
      return {
        type: "operator",
        op: "/",
        left: { type: "number", value: num },
        right: { type: "number", value: den },
      };
    }
  }

  // 乗算項の約分
  if (numeratorTerm.type === "operator" && numeratorTerm.op === "*") {
    const numFactors = flattenMultiplication(
      numeratorTerm.left,
      numeratorTerm.right
    );
    const denFactors =
      denominator.type === "operator" && denominator.op === "*"
        ? flattenMultiplication(denominator.left, denominator.right)
        : [denominator];

    let numCoeff = 1;
    let denCoeff = 1;
    const remainingNumFactors: ASTNode[] = [];
    const remainingDenFactors: ASTNode[] = [];

    // 数値係数を抽出
    for (const factor of numFactors) {
      if (factor.type === "number") {
        numCoeff *= factor.value;
      } else {
        remainingNumFactors.push(factor);
      }
    }

    for (const factor of denFactors) {
      if (factor.type === "number") {
        denCoeff *= factor.value;
      } else {
        remainingDenFactors.push(factor);
      }
    }

    // 数値係数の約分
    const { num: coeffNum, den: coeffDen } = simplifyFraction(
      numCoeff,
      denCoeff
    );

    // 共通因子の約分
    const finalNumFactors: ASTNode[] = [];
    const finalDenFactors: ASTNode[] = [];

    for (const numFactor of remainingNumFactors) {
      let canceled = false;
      for (let i = 0; i < remainingDenFactors.length; i++) {
        if (astEqual(numFactor, remainingDenFactors[i])) {
          // 共通因子をキャンセル
          remainingDenFactors.splice(i, 1);
          canceled = true;
          break;
        }
      }
      if (!canceled) {
        finalNumFactors.push(numFactor);
      }
    }

    finalDenFactors.push(...remainingDenFactors);

    // 結果の構築
    let result: ASTNode;

    if (coeffNum !== 1 || finalNumFactors.length > 0) {
      const numParts: ASTNode[] = [];
      if (coeffNum !== 1) {
        numParts.push({ type: "number", value: coeffNum });
      }
      numParts.push(...finalNumFactors);

      result =
        numParts.length === 1
          ? numParts[0]
          : numParts.reduce((a, b) => ({
              type: "operator",
              op: "*",
              left: a,
              right: b,
            }));
    } else {
      result = { type: "number", value: 1 };
    }

    if (coeffDen !== 1 || finalDenFactors.length > 0) {
      const denParts: ASTNode[] = [];
      if (coeffDen !== 1) {
        denParts.push({ type: "number", value: coeffDen });
      }
      denParts.push(...finalDenFactors);

      const denResult =
        denParts.length === 1
          ? denParts[0]
          : denParts.reduce((a, b) => ({
              type: "operator",
              op: "*",
              left: a,
              right: b,
            }));

      if (result.type === "number" && result.value === 1) {
        return {
          type: "operator",
          op: "/",
          left: { type: "number", value: 1 },
          right: denResult,
        };
      } else {
        return {
          type: "operator",
          op: "/",
          left: result,
          right: denResult,
        };
      }
    }

    return result;
  }

  // 分子と分母が等しい場合
  if (astEqual(numeratorTerm, denominator)) {
    return { type: "number", value: 1 };
  }

  // 約分できない場合
  return null;
}

// ASTノードの等価性チェック
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
