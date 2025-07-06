import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { evaluateNumericOps } from "./helpers";
import { simplifyAddition } from "./simplifyAddition";
import { simplifyMultiplication } from "./simplifyMultiplication";
import { simplifyPower } from "./simplifyPower";
import { flattenAddition } from "./flattenAddition";
import { flattenMultiplication } from "./flattenMultiplication";
import { extractCoefficient } from "./extractCoefficient";
import { tryFactorization } from "./tryFactorization";

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

// 除算の簡約化
function simplifyDivision(
  numerator: ASTNode,
  denominator: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  // 分子と分母が等しい場合は1を返す
  if (astEqual(numerator, denominator)) {
    return { type: "number", value: 1 };
  }

  // 分母が1の場合は分子をそのまま返す
  if (denominator.type === "number" && denominator.value === 1) {
    return numerator;
  }

  // 分子が0の場合は0を返す
  if (numerator.type === "number" && numerator.value === 0) {
    return { type: "number", value: 0 };
  }

  // 分子を先に因数分解してみる
  const factorizedNumerator = tryFactorization(numerator);

  // 因数分解された分子で再試行
  if (!astEqual(factorizedNumerator, numerator)) {
    return simplifyDivision(factorizedNumerator, denominator, options);
  }

  // 分子が加算の場合、各項から分母を約分できるかチェック
  if (numerator.type === "operator" && numerator.op === "+") {
    const numeratorTerms = flattenAddition(numerator.left, numerator.right);
    const simplifiedTerms: ASTNode[] = [];
    let allTermsSimplified = true;

    for (const term of numeratorTerms) {
      const simplifiedTerm = simplifyDivision(term, denominator, options);

      // 約分できなかった場合（元の除算形のまま）
      if (
        simplifiedTerm.type === "operator" &&
        simplifiedTerm.op === "/" &&
        astEqual(simplifiedTerm.right, denominator)
      ) {
        allTermsSimplified = false;
        break;
      }

      simplifiedTerms.push(simplifiedTerm);
    }

    // すべての項が約分できた場合
    if (allTermsSimplified && simplifiedTerms.length > 0) {
      if (simplifiedTerms.length === 1) {
        return simplifiedTerms[0];
      } else {
        return simplifiedTerms.reduce((acc, term) => ({
          type: "operator",
          op: "+",
          left: acc,
          right: term,
        }));
      }
    }
  }

  // 分子が乗算の場合、分母と共通因子があるかチェック
  if (numerator.type === "operator" && numerator.op === "*") {
    const numeratorFactors = flattenMultiplication(
      numerator.left,
      numerator.right
    );
    const remainingFactors: ASTNode[] = [];
    let foundCommonFactor = false;

    for (const factor of numeratorFactors) {
      if (!foundCommonFactor && astEqual(factor, denominator)) {
        foundCommonFactor = true;
        // この因子は約分される
      } else {
        remainingFactors.push(factor);
      }
    }

    if (foundCommonFactor) {
      if (remainingFactors.length === 0) {
        return { type: "number", value: 1 };
      } else if (remainingFactors.length === 1) {
        return remainingFactors[0];
      } else {
        return remainingFactors.reduce((acc, factor) => ({
          type: "operator",
          op: "*",
          left: acc,
          right: factor,
        }));
      }
    }
  }

  // 分子と分母の係数を抽出して約分を試みる
  const { coefficient: numCoeff, base: numBase } =
    extractCoefficient(numerator);
  const { coefficient: denCoeff, base: denBase } =
    extractCoefficient(denominator);

  // 基底が等しい場合
  if (astEqual(numBase, denBase)) {
    if (denCoeff === 0) {
      throw new Error("Division by zero");
    }
    const resultCoeff = numCoeff / denCoeff;
    return { type: "number", value: resultCoeff };
  }

  // 数値計算を先に試行
  const numericResult = evaluateNumericOps(
    { type: "operator", op: "/", left: numerator, right: denominator },
    options
  );
  if (numericResult) {
    return numericResult;
  }

  // 簡約化できない場合はそのまま返す
  return { type: "operator", op: "/", left: numerator, right: denominator };
}

// 乗算結果の中の数値べき乗を評価する
function evaluateNumericPowersInMultiplication(
  node: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  if (node.type === "operator" && node.op === "*") {
    const left = evaluateNumericPowersInMultiplication(node.left, options);
    const right = evaluateNumericPowersInMultiplication(node.right, options);
    return { ...node, left, right };
  } else if (node.type === "operator" && node.op === "^") {
    // べき乗ノードの場合、数値評価を試行
    const numericResult = evaluateNumericOps(node, options);
    return numericResult || node;
  } else {
    return node;
  }
}

// 正規化されたASTを簡約化
export function simplifyNormalizedAST(
  node: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  if (node.type === "operator") {
    // まず子ノードを再帰的に簡約化
    const left = simplifyNormalizedAST(node.left, options);
    const right = simplifyNormalizedAST(node.right, options);

    switch (node.op) {
      case "+":
        return simplifyAddition(left, right, options);
      case "*":
        const multiplicationResult = simplifyMultiplication(left, right);
        // 乗算結果の中に数値べき乗がある場合、数値評価を実行
        return evaluateNumericPowersInMultiplication(
          multiplicationResult,
          options
        );
      case "/":
        return simplifyDivision(left, right, options);
      case "^":
        // べき乗の場合は先にsimplifyPowerを実行
        const powerResult = simplifyPower(left, right, options);
        // 数値計算は構造変換が行われなかった場合のみ
        if (powerResult.type === "operator" && powerResult.op === "^") {
          const powerNumericResult = evaluateNumericOps(powerResult, options);
          return powerNumericResult || powerResult;
        }
        // 展開結果の中の数値べき乗も評価
        const finalResult = evaluateNumericPowersInMultiplication(
          powerResult,
          options
        );
        return finalResult;
      default:
        // その他の演算子の場合は数値計算を先に試行
        const numericResult = evaluateNumericOps(
          { ...node, left, right },
          options
        );
        return numericResult || { ...node, left, right };
    }
  } else if (node.type === "function") {
    return {
      ...node,
      args: node.args.map((arg) => simplifyNormalizedAST(arg, options)),
    };
  }

  return node;
}
