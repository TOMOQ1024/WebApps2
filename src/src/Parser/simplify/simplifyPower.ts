import { ASTNode } from "../ASTNode";
import { isZero, isOne } from "./helpers";

// べき乗の簡約化
export function simplifyPower(base: ASTNode, exponent: ASTNode): ASTNode {
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
