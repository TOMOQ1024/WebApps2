import { ASTNode } from "../ASTNode";
import { simplifyFraction } from "./helpers";
import { flattenMultiplication } from "./flattenMultiplication";
import { flattenAddition } from "./flattenAddition";
import { extractCoefficient } from "./extractCoefficient";

// 最大公約数を計算
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// 複数の数値の最大公約数を計算
function findGCD(numbers: number[]): number {
  if (numbers.length === 0) return 1;
  if (numbers.length === 1) return Math.abs(numbers[0]);

  return numbers.reduce((acc, num) => gcd(acc, num), numbers[0]);
}

// 分数の数値約分を行う
export function simplifyNumericFractions(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    const left = simplifyNumericFractions(node.left);
    const right = simplifyNumericFractions(node.right);

    // 分数形式の数値約分
    if (
      node.op === "/" &&
      left.type === "number" &&
      right.type === "number" &&
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

    // 分数で分子が加算の場合の係数約分
    if (
      node.op === "/" &&
      left.type === "operator" &&
      left.op === "+" &&
      right.type === "number" &&
      right.value !== 0
    ) {
      const terms = flattenAddition(left.left, left.right);
      const coefficientsAndBases = terms.map((term) =>
        extractCoefficient(term)
      );

      // すべての係数を取得
      const coefficients = coefficientsAndBases.map((cb) => cb.coefficient);
      const coeffGCD = findGCD(coefficients.filter((c) => c !== 0));

      if (coeffGCD > 1) {
        // 分子から共通因子を抽出
        const newTerms = coefficientsAndBases.map(({ coefficient, base }) => {
          const newCoeff = coefficient / coeffGCD;

          if (newCoeff === 1) {
            if (base.type === "number" && base.value === 1) {
              return { type: "number", value: 1 } as ASTNode;
            } else {
              return base;
            }
          } else if (base.type === "number" && base.value === 1) {
            return { type: "number", value: newCoeff } as ASTNode;
          } else {
            return {
              type: "operator" as const,
              op: "*" as const,
              left: { type: "number" as const, value: newCoeff },
              right: base,
            };
          }
        });

        // 新しい分子を構築
        const newNumerator = newTerms.reduce((a, b) => ({
          type: "operator" as const,
          op: "+" as const,
          left: a,
          right: b,
        }));

        // 分母と約分
        const { num: finalNum, den: finalDen } = simplifyFraction(
          coeffGCD,
          right.value
        );

        if (finalDen === 1) {
          // 分母が1になる場合
          if (finalNum === 1) {
            return newNumerator;
          } else {
            return {
              type: "operator",
              op: "*",
              left: { type: "number" as const, value: finalNum },
              right: newNumerator,
            };
          }
        } else {
          // 分母が残る場合
          let finalNumerator: ASTNode;
          if (finalNum === 1) {
            finalNumerator = newNumerator;
          } else {
            finalNumerator = {
              type: "operator",
              op: "*",
              left: { type: "number" as const, value: finalNum },
              right: newNumerator,
            };
          }

          return {
            type: "operator",
            op: "/",
            left: finalNumerator,
            right: { type: "number" as const, value: finalDen },
          };
        }
      }
    }

    // 分数で分子が乗算の場合の係数約分
    if (
      node.op === "/" &&
      left.type === "operator" &&
      left.op === "*" &&
      right.type === "number" &&
      right.value !== 0
    ) {
      const factors = flattenMultiplication(left.left, left.right);
      let numeratorCoeff = 1;
      const nonNumericFactors: ASTNode[] = [];

      for (const factor of factors) {
        if (factor.type === "number") {
          numeratorCoeff *= factor.value;
        } else {
          nonNumericFactors.push(factor);
        }
      }

      if (numeratorCoeff !== 1) {
        const { num, den } = simplifyFraction(numeratorCoeff, right.value);

        if (den === 1) {
          // 分母が1になる場合
          if (num === 1) {
            if (nonNumericFactors.length === 0) {
              return { type: "number", value: 1 };
            } else if (nonNumericFactors.length === 1) {
              return nonNumericFactors[0];
            } else {
              return nonNumericFactors.reduce((a, b) => ({
                type: "operator",
                op: "*",
                left: a,
                right: b,
              }));
            }
          } else {
            if (nonNumericFactors.length === 0) {
              return { type: "number", value: num };
            } else {
              const nonNumericPart =
                nonNumericFactors.length === 1
                  ? nonNumericFactors[0]
                  : nonNumericFactors.reduce((a, b) => ({
                      type: "operator",
                      op: "*",
                      left: a,
                      right: b,
                    }));
              return {
                type: "operator",
                op: "*",
                left: { type: "number", value: num },
                right: nonNumericPart,
              };
            }
          }
        } else {
          // 分母が1でない場合、約分後の分数形式で返す
          if (nonNumericFactors.length === 0) {
            return {
              type: "operator",
              op: "/",
              left: { type: "number", value: num },
              right: { type: "number", value: den },
            };
          } else {
            const nonNumericPart =
              nonNumericFactors.length === 1
                ? nonNumericFactors[0]
                : nonNumericFactors.reduce((a, b) => ({
                    type: "operator",
                    op: "*",
                    left: a,
                    right: b,
                  }));

            if (num === 1) {
              return {
                type: "operator",
                op: "/",
                left: nonNumericPart,
                right: { type: "number", value: den },
              };
            } else {
              return {
                type: "operator",
                op: "/",
                left: {
                  type: "operator",
                  op: "*",
                  left: { type: "number", value: num },
                  right: nonNumericPart,
                },
                right: { type: "number", value: den },
              };
            }
          }
        }
      }
    }

    // 分数で分母が乗算の場合の係数約分
    if (
      node.op === "/" &&
      left.type === "number" &&
      left.value !== 0 &&
      right.type === "operator" &&
      right.op === "*"
    ) {
      const factors = flattenMultiplication(right.left, right.right);
      let denominatorCoeff = 1;
      const nonNumericFactors: ASTNode[] = [];

      for (const factor of factors) {
        if (factor.type === "number") {
          denominatorCoeff *= factor.value;
        } else {
          nonNumericFactors.push(factor);
        }
      }

      if (denominatorCoeff !== 1) {
        const { num, den } = simplifyFraction(left.value, denominatorCoeff);

        if (nonNumericFactors.length === 0) {
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
        } else {
          const nonNumericPart =
            nonNumericFactors.length === 1
              ? nonNumericFactors[0]
              : nonNumericFactors.reduce((a, b) => ({
                  type: "operator",
                  op: "*",
                  left: a,
                  right: b,
                }));

          if (den === 1) {
            if (num === 1) {
              return {
                type: "operator",
                op: "^",
                left: nonNumericPart,
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
                  left: nonNumericPart,
                  right: { type: "number", value: -1 },
                },
              };
            }
          } else {
            return {
              type: "operator",
              op: "/",
              left: { type: "number", value: num },
              right: {
                type: "operator",
                op: "*",
                left: { type: "number", value: den },
                right: nonNumericPart,
              },
            };
          }
        }
      }
    }

    // 乗算で分数が含まれる場合の約分
    if (
      node.op === "*" &&
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

    // 乗算で分数が右側にある場合
    if (
      node.op === "*" &&
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

    // 複雑な乗算で分数が右側にある場合 (複数項 * 分数)
    if (
      node.op === "*" &&
      right.type === "operator" &&
      right.op === "/" &&
      right.left.type === "number" &&
      right.right.type === "number"
    ) {
      // 左辺から係数を抽出
      const factors = flattenMultiplication(left, { type: "number", value: 1 });
      let coeff = 1;
      const nonNumericFactors: ASTNode[] = [];

      for (const factor of factors) {
        if (factor.type === "number") {
          coeff *= factor.value;
        } else {
          nonNumericFactors.push(factor);
        }
      }

      // 分数との約分
      const numerator = coeff * right.left.value;
      const denominator = right.right.value;
      const { num, den } = simplifyFraction(numerator, denominator);

      if (den === 1) {
        // 分母が1になる場合
        if (num === 1) {
          if (nonNumericFactors.length === 0) {
            return { type: "number", value: 1 };
          } else if (nonNumericFactors.length === 1) {
            return nonNumericFactors[0];
          } else {
            return nonNumericFactors.reduce((a, b) => ({
              type: "operator",
              op: "*",
              left: a,
              right: b,
            }));
          }
        } else {
          if (nonNumericFactors.length === 0) {
            return { type: "number", value: num };
          } else {
            const nonNumericPart =
              nonNumericFactors.length === 1
                ? nonNumericFactors[0]
                : nonNumericFactors.reduce((a, b) => ({
                    type: "operator",
                    op: "*",
                    left: a,
                    right: b,
                  }));
            return {
              type: "operator",
              op: "*",
              left: { type: "number", value: num },
              right: nonNumericPart,
            };
          }
        }
      } else {
        // 分母が1でない場合、分数形式で返す
        if (nonNumericFactors.length === 0) {
          return {
            type: "operator",
            op: "/",
            left: { type: "number", value: num },
            right: { type: "number", value: den },
          };
        } else {
          const nonNumericPart =
            nonNumericFactors.length === 1
              ? nonNumericFactors[0]
              : nonNumericFactors.reduce((a, b) => ({
                  type: "operator",
                  op: "*",
                  left: a,
                  right: b,
                }));

          if (num === 1) {
            return {
              type: "operator",
              op: "/",
              left: nonNumericPart,
              right: { type: "number", value: den },
            };
          } else {
            return {
              type: "operator",
              op: "/",
              left: {
                type: "operator",
                op: "*",
                left: { type: "number", value: num },
                right: nonNumericPart,
              },
              right: { type: "number", value: den },
            };
          }
        }
      }
    }

    // Nested fraction: (a/b)/c = a/(b*c)
    if (node.op === "/" && left.type === "operator" && left.op === "/") {
      return simplifyNumericFractions({
        type: "operator",
        op: "/",
        left: left.left,
        right: {
          type: "operator",
          op: "*",
          left: left.right,
          right: right,
        },
      });
    }

    return { ...node, left, right };
  } else if (node.type === "function") {
    return {
      ...node,
      args: node.args.map((arg) => simplifyNumericFractions(arg)),
    };
  }

  return node;
}
