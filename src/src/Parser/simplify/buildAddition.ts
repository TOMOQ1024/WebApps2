import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { tryFactorization } from "./tryFactorization";

// 加算を構築
export function buildAddition(
  groups: Map<string, { coefficient: number; base: ASTNode }>,
  options?: SimplifyOptions
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
      // 係数と複合式の組み合わせを適切に処理
      if (base.type === "operator" && (base.op === "+" || base.op === "-")) {
        // 複合式の場合は \\left(\\right) で囲む形式にする
        terms.push({
          type: "operator",
          op: "*",
          left: { type: "number", value: coefficient },
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
