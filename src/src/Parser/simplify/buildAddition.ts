import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { tryFactorization } from "./tryFactorization";
import { simplifyFraction } from "./helpers";

// 係数を分数形式に統一して通分処理を行う
function unifyFractionCoefficients(
  groups: Map<string, { coefficient: number; base: ASTNode }>,
  options?: SimplifyOptions
): Map<string, { coefficient: number; base: ASTNode }> {
  if (options?.rationalMode !== "fraction") {
    return groups;
  }

  const result = new Map<string, { coefficient: number; base: ASTNode }>();

  for (const [key, { coefficient, base }] of groups.entries()) {
    if (coefficient === 0) continue;

    // 係数を分数として処理
    let numerator = coefficient;
    let denominator = 1;

    if (!Number.isInteger(coefficient)) {
      // 小数を分数に変換
      const tolerance = 1e-10;
      let found = false;
      for (let den = 2; den <= 1000; den++) {
        const num = Math.round(coefficient * den);
        if (Math.abs(coefficient - num / den) < tolerance) {
          const { num: simplifiedNum, den: simplifiedDen } = simplifyFraction(
            num,
            den
          );
          numerator = simplifiedNum;
          denominator = simplifiedDen;
          found = true;
          break;
        }
      }
      if (!found) {
        numerator = coefficient;
        denominator = 1;
      }
    }

    // 分数として統一された係数で更新
    const unifiedCoefficient = numerator / denominator;
    result.set(key, { coefficient: unifiedCoefficient, base });
  }

  return result;
}

// 分数係数を適切なASTノードに変換
function createCoefficientNode(
  coefficient: number,
  options?: SimplifyOptions
): ASTNode {
  if (Number.isInteger(coefficient)) {
    return { type: "number", value: coefficient };
  }

  // 分数係数の場合
  if (options?.rationalMode === "fraction") {
    // 分数として表現
    const tolerance = 1e-10;
    for (let denominator = 2; denominator <= 1000; denominator++) {
      const numerator = Math.round(coefficient * denominator);
      if (Math.abs(coefficient - numerator / denominator) < tolerance) {
        const { num, den } = simplifyFraction(numerator, denominator);
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
    }
  }

  // 指数形式として表現（デフォルト）
  const tolerance = 1e-10;
  for (let denominator = 2; denominator <= 1000; denominator++) {
    const numerator = Math.round(coefficient * denominator);
    if (Math.abs(coefficient - numerator / denominator) < tolerance) {
      const { num, den } = simplifyFraction(numerator, denominator);
      if (den === 1) {
        return { type: "number", value: num };
      } else {
        // 指数形式: num * den^{-1}
        if (num === 1) {
          return {
            type: "operator",
            op: "^",
            left: { type: "number", value: den },
            right: { type: "number", value: -1 },
          };
        } else {
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: num },
            right: {
              type: "operator",
              op: "^",
              left: { type: "number", value: den },
              right: { type: "number", value: -1 },
            },
          };
        }
      }
    }
  }

  // フォールバック: 元の数値
  return { type: "number", value: coefficient };
}

// 加算を構築
export function buildAddition(
  groups: Map<string, { coefficient: number; base: ASTNode }>,
  options?: SimplifyOptions
): ASTNode {
  // 分数モードの場合は係数を統一
  const unifiedGroups = unifyFractionCoefficients(groups, options);

  const terms: ASTNode[] = [];

  for (const { coefficient, base } of unifiedGroups.values()) {
    if (coefficient === 0) continue;

    if (base.type === "number" && base.value === 1) {
      // 定数項
      const coeffNode = createCoefficientNode(coefficient, options);
      terms.push(coeffNode);
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
      // 係数と複合式の組み合わせを適切に処理
      const coeffNode = createCoefficientNode(coefficient, options);

      if (base.type === "operator" && (base.op === "+" || base.op === "-")) {
        // 複合式の場合は \\left(\\right) で囲む形式にする
        terms.push({
          type: "operator",
          op: "*",
          left: coeffNode,
          right: base,
        });
      } else {
        terms.push({
          type: "operator",
          op: "*",
          left: coeffNode,
          right: base,
        });
      }
    }
  }

  if (terms.length === 0) {
    return { type: "number", value: 0 };
  } else if (terms.length === 1) {
    return terms[0];
  } else {
    // 項をソート
    if (options?.termOrder === "dictionary") {
      // 辞書順でソート（数値を先頭に）
      terms.sort((a, b) => {
        // 数値項を先頭に
        if (a.type === "number" && b.type !== "number") return -1;
        if (a.type !== "number" && b.type === "number") return 1;

        const stringA = getTermString(a);
        const stringB = getTermString(b);
        return stringA.localeCompare(stringB);
      });
    } else {
      // 従来の優先順位でソート（定数項を先頭に、その後は辞書順）
      terms.sort((a, b) => {
        const priorityA = getTermPriority(a);
        const priorityB = getTermPriority(b);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // 同じ優先順位の場合は文字列比較
        return getTermString(a).localeCompare(getTermString(b));
      });
    }

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

// 項の優先順位を取得
function getTermPriority(term: ASTNode): number {
  if (term.type === "number") {
    // 数値の場合、正の数を先に、負の数を後に
    return term.value >= 0 ? 0 : 5;
  } else if (term.type === "symbol") {
    return 1; // 単項式
  } else if (term.type === "function") {
    return 1; // 関数も単項式と同じ
  } else if (term.type === "operator" && term.op === "^") {
    return 1; // べき乗も単項式と同じ
  } else if (term.type === "operator" && term.op === "*") {
    // 係数付きの項は係数なしの項より後
    if (term.left.type === "number") {
      return 2; // 係数付きの項
    } else {
      return 1; // 係数なしの乗算
    }
  } else if (term.type === "operator" && term.op === "+") {
    return 3; // 複合式
  } else {
    return 4; // その他
  }
}

// 項を文字列として表現
function getTermString(term: ASTNode): string {
  if (term.type === "number") {
    return term.value.toString();
  } else if (term.type === "symbol") {
    return term.name;
  } else if (term.type === "function") {
    // 関数の場合、関数名と引数を含める
    const argsStr = term.args
      ? term.args.map((arg) => getTermString(arg)).join(",")
      : "";
    return `${term.name}(${argsStr})`;
  } else if (term.type === "operator" && term.op === "*") {
    // 係数付きの項の場合、基底部分で比較
    if (term.left.type === "number") {
      const baseString = getTermString(term.right);
      // 係数付きの項は基底部分の後に係数を考慮
      return baseString + "_coeff_" + term.left.value;
    }
    // 複合式の乗算の場合、変数の順序を考慮
    const leftString = getTermString(term.left);
    const rightString = getTermString(term.right);
    return leftString + "*" + rightString;
  } else if (term.type === "operator" && term.op === "^") {
    // べき乗の場合、基底部分で比較
    return getTermString(term.left) + "^" + getTermString(term.right);
  } else if (term.type === "operator" && term.op === "+") {
    // 加算の場合、最初の項で比較
    return getTermString(term.left) + "+" + getTermString(term.right);
  } else if (term.type === "operator" && term.op === "-") {
    // 減算の場合
    return getTermString(term.left) + "-" + getTermString(term.right);
  }
  return JSON.stringify(term);
}
