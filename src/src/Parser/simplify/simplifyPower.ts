import { ASTNode } from "../ASTNode";
import { SimplifyOptions } from "./simplifyLaTeX";
import { isZero, isOne, simplifyFraction } from "./helpers";

// べき乗の簡約化
export function simplifyPower(
  base: ASTNode,
  exponent: ASTNode,
  options?: SimplifyOptions
): ASTNode {
  // a^0 → 1
  if (isZero(exponent)) return { type: "number", value: 1 };

  // a^1 → a
  if (isOne(exponent)) return base;

  // 指数が分数の場合は約分
  if (
    exponent.type === "operator" &&
    exponent.op === "/" &&
    exponent.left.type === "number" &&
    exponent.right.type === "number" &&
    Number.isInteger(exponent.left.value) &&
    Number.isInteger(exponent.right.value)
  ) {
    const { num, den } = simplifyFraction(
      exponent.left.value,
      exponent.right.value
    );
    if (den === 1) {
      return {
        type: "operator",
        op: "^",
        left: base,
        right: { type: "number", value: num },
      };
    } else {
      return {
        type: "operator",
        op: "^",
        left: base,
        right: {
          type: "operator",
          op: "/",
          left: { type: "number", value: num },
          right: { type: "number", value: den },
        },
      };
    }
  }

  // 指数が a * b^{-1} 形式の分数の場合も約分
  if (
    exponent.type === "operator" &&
    exponent.op === "*" &&
    exponent.left.type === "number" &&
    exponent.right.type === "operator" &&
    exponent.right.op === "^" &&
    exponent.right.left.type === "number" &&
    exponent.right.right.type === "number" &&
    exponent.right.right.value === -1 &&
    Number.isInteger(exponent.left.value) &&
    Number.isInteger(exponent.right.left.value)
  ) {
    const numerator = exponent.left.value;
    const denominator = exponent.right.left.value;
    const { num, den } = simplifyFraction(numerator, denominator);

    if (den === 1) {
      return {
        type: "operator",
        op: "^",
        left: base,
        right: { type: "number", value: num },
      };
    } else {
      return {
        type: "operator",
        op: "^",
        left: base,
        right: {
          type: "operator",
          op: "/",
          left: { type: "number", value: num },
          right: { type: "number", value: den },
        },
      };
    }
  }

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

  // a^{-1} → 1/a の変換を避けて、a^{-1} を a^{-1} のまま保持
  // ただし、e^{x}^{-1} → e^{-x} の簡単化は行う
  if (
    base.type === "operator" &&
    base.op === "^" &&
    exponent.type === "number" &&
    exponent.value === -1
  ) {
    return {
      type: "operator",
      op: "^",
      left: base.left,
      right: {
        type: "operator",
        op: "*",
        left: { type: "number", value: -1 },
        right: base.right,
      },
    };
  }

  // (a * b)^n → a^n * b^n の展開
  if (
    base.type === "operator" &&
    base.op === "*" &&
    exponent.type === "number" &&
    Number.isInteger(exponent.value) &&
    Math.abs(exponent.value) <= 3 // 展開は小さな指数のみに制限
  ) {
    const leftPower = simplifyPower(base.left, exponent, options);
    const rightPower = simplifyPower(base.right, exponent, options);
    return {
      type: "operator",
      op: "*",
      left: leftPower,
      right: rightPower,
    };
  }

  // 小さな整数のべき乗のみ計算（computedモードの場合のみ）
  if (
    options?.numericMode === "computed" &&
    base.type === "number" &&
    exponent.type === "number" &&
    Number.isInteger(base.value) &&
    Number.isInteger(exponent.value) &&
    Math.abs(base.value) <= 10 &&
    Math.abs(exponent.value) <= 10 &&
    exponent.value >= 0
  ) {
    return { type: "number", value: Math.pow(base.value, exponent.value) };
  }

  return { type: "operator", op: "^", left: base, right: exponent };
}
