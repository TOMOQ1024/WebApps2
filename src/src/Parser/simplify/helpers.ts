import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";

// ヘルパー関数
export function isZero(node: ASTNode): boolean {
  return node.type === "number" && node.value === 0;
}

export function isOne(node: ASTNode): boolean {
  return node.type === "number" && node.value === 1;
}

// 数値演算の評価
export function evaluateNumericOps(
  node: ASTNode,
  options?: SimplifyOptions
): ASTNode | null {
  if (node.type !== "operator") return null;
  const { op, left, right } = node;

  if (left.type === "number" && right.type === "number") {
    switch (op) {
      case "+":
        return { type: "number", value: left.value + right.value };
      case "*":
        return { type: "number", value: left.value * right.value };
      case "^":
        // computedモードの場合のみ、限定的なべき乗数値評価
        if (options?.numericMode === "computed") {
          return { type: "number", value: Math.pow(left.value, right.value) };
        }
        return null;
      case "/":
        // 分数の場合は約分を試行
        if (
          Number.isInteger(left.value) &&
          Number.isInteger(right.value) &&
          right.value !== 0
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
        return null;
    }
  }

  // 乗算での分数の簡約化 (a/b * c → ac/b)
  if (
    op === "*" &&
    left.type === "operator" &&
    left.op === "/" &&
    left.left.type === "number" &&
    left.right.type === "number" &&
    right.type === "number"
  ) {
    const numerator = left.left.value * right.value;
    const denominator = left.right.value;
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

  // 乗算での分数の簡約化 (a * b/c → ab/c)
  if (
    op === "*" &&
    left.type === "number" &&
    right.type === "operator" &&
    right.op === "/" &&
    right.left.type === "number" &&
    right.right.type === "number"
  ) {
    const numerator = left.value * right.left.value;
    const denominator = right.right.value;
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

  return null;
}

// 最大公約数を求める
export function gcd(a: number, b: number): number {
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
export function simplifyFraction(
  numerator: number,
  denominator: number
): { num: number; den: number } {
  if (denominator === 0) return { num: numerator, den: denominator };

  // 整数でない場合は約分しない
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    return { num: numerator, den: denominator };
  }

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
