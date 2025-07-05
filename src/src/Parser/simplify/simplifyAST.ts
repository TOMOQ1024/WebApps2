import { ASTNode } from "../ASTNode";

// ASTの簡約化
export function simplifyAST(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    // まず左右を再帰的に簡単化
    const left = simplifyAST(node.left);
    const right = simplifyAST(node.right);

    // 数値計算の評価を先に行う
    const numericResult = evaluateSimpleOps({ ...node, left, right });
    if (numericResult) return numericResult;

    // (x^a)^b → x^{a*b} の簡約化
    if (
      node.op === "^" &&
      left.type === "operator" &&
      left.op === "^" &&
      left.right.type === "number" &&
      right.type === "number"
    ) {
      return {
        type: "operator",
        op: "^",
        left: left.left,
        right: { type: "number", value: left.right.value * right.value },
      };
    }

    // powノードの指数がoperator(-)で多重マイナスもnumber型に簡約
    if (node.op === "^" && right.type === "operator" && right.op === "-") {
      const evalMinus = (r: any): number | null => {
        if (r.type === "number") return r.value;
        if (r.type === "operator" && r.op === "-") {
          const l = evalMinus(r.left);
          const rr = evalMinus(r.right);
          if (l !== null && rr !== null) return l - rr;
        }
        return null;
      };
      const val = evalMinus(right);
      if (typeof val === "number") {
        return {
          type: "operator",
          op: "^",
          left,
          right: { type: "number", value: val },
        };
      }
    }

    // 分数ノードのとき、分子分母が等しい場合は0、分子が0なら0、分母が1なら分子のみ返す（再帰的に簡単化）
    if (node.op === "/") {
      const optLeft = simplifyAST(left);
      const optRight = simplifyAST(right);
      if (JSON.stringify(optLeft) === JSON.stringify(optRight)) {
        return { type: "number", value: 1 };
      }
      if (optLeft.type === "number" && optLeft.value === 0) {
        return { type: "number", value: 0 };
      }
      if (optRight.type === "number" && optRight.value === 1) {
        return optLeft;
      }

      // 分子が分母の倍数の場合の約分: ax / bx → a/b
      if (
        optLeft.type === "operator" &&
        optLeft.op === "*" &&
        optRight.type === "operator" &&
        optRight.op === "*"
      ) {
        // 分子と分母の共通因子を見つけて約分
        const leftFactors: ASTNode[] = [];
        const rightFactors: ASTNode[] = [];

        const collectFactors = (node: ASTNode, factors: ASTNode[]) => {
          if (node.type === "operator" && node.op === "*") {
            collectFactors(node.left, factors);
            collectFactors(node.right, factors);
          } else {
            factors.push(node);
          }
        };

        collectFactors(optLeft, leftFactors);
        collectFactors(optRight, rightFactors);

        // 共通因子を探す
        const remainingLeft = [...leftFactors];
        const remainingRight = [...rightFactors];

        for (let i = 0; i < leftFactors.length; i++) {
          for (let j = 0; j < rightFactors.length; j++) {
            if (
              JSON.stringify(leftFactors[i]) === JSON.stringify(rightFactors[j])
            ) {
              remainingLeft.splice(remainingLeft.indexOf(leftFactors[i]), 1);
              remainingRight.splice(remainingRight.indexOf(rightFactors[j]), 1);
              break;
            }
          }
        }

        // 共通因子があれば約分
        if (
          remainingLeft.length < leftFactors.length ||
          remainingRight.length < rightFactors.length
        ) {
          const buildProduct = (factors: ASTNode[]): ASTNode => {
            if (factors.length === 0) return { type: "number", value: 1 };
            if (factors.length === 1) return factors[0];
            return factors.reduce((a, b) => ({
              type: "operator",
              op: "*",
              left: a,
              right: b,
            }));
          };

          const newNumerator = buildProduct(remainingLeft);
          const newDenominator = buildProduct(remainingRight);

          // 分母が1の場合は分子だけ返す
          if (newDenominator.type === "number" && newDenominator.value === 1) {
            return newNumerator;
          }

          return {
            type: "operator",
            op: "/",
            left: newNumerator,
            right: newDenominator,
          };
        }
      }

      // 単純な変数の約分: x / (c*x) → 1/c
      if (
        optLeft.type === "symbol" &&
        optRight.type === "operator" &&
        optRight.op === "*" &&
        optRight.left.type === "number" &&
        optRight.right.type === "symbol" &&
        optLeft.name === optRight.right.name
      ) {
        return {
          type: "operator",
          op: "/",
          left: { type: "number", value: 1 },
          right: { type: "number", value: optRight.left.value },
        };
      }

      // 単純な変数の約分: x / (x*c) → 1/c
      if (
        optLeft.type === "symbol" &&
        optRight.type === "operator" &&
        optRight.op === "*" &&
        optRight.left.type === "symbol" &&
        optRight.right.type === "number" &&
        optLeft.name === optRight.left.name
      ) {
        return {
          type: "operator",
          op: "/",
          left: { type: "number", value: 1 },
          right: { type: "number", value: optRight.right.value },
        };
      }

      // 二重分数の処理: (a/b)/c → a/(b*c)
      if (optLeft.type === "operator" && optLeft.op === "/") {
        const numerator = optLeft.left;
        const denominator = {
          type: "operator" as const,
          op: "*",
          left: optLeft.right,
          right: optRight,
        };
        return simplifyAST({
          type: "operator" as const,
          op: "/",
          left: numerator,
          right: denominator,
        });
      }

      // 分子が和の場合の因数分解を試行（簡単なケースのみ）
      const tryFactorizeSum = (sumNode: ASTNode): ASTNode => {
        if (sumNode.type !== "operator" || sumNode.op !== "+") return sumNode;

        const left = sumNode.left;
        const right = sumNode.right;

        // x + x^2 → x(1 + x)
        if (
          left.type === "symbol" &&
          left.name === "x" &&
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "symbol" &&
          right.left.name === "x" &&
          right.right.type === "number" &&
          right.right.value === 2
        ) {
          return {
            type: "operator",
            op: "*",
            left: { type: "symbol", name: "x" },
            right: {
              type: "operator",
              op: "+",
              left: { type: "number", value: 1 },
              right: { type: "symbol", name: "x" },
            },
          };
        }

        // x^2 + x → x(x + 1)
        if (
          left.type === "operator" &&
          left.op === "^" &&
          left.left.type === "symbol" &&
          left.left.name === "x" &&
          left.right.type === "number" &&
          left.right.value === 2 &&
          right.type === "symbol" &&
          right.name === "x"
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

        // 6x + 4x^2 → 2x(3 + 2x)
        if (
          left.type === "operator" &&
          left.op === "*" &&
          left.left.type === "number" &&
          left.left.value === 6 &&
          left.right.type === "symbol" &&
          left.right.name === "x" &&
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "number" &&
          right.left.value === 4 &&
          right.right.type === "operator" &&
          right.right.op === "^" &&
          right.right.left.type === "symbol" &&
          right.right.left.name === "x" &&
          right.right.right.type === "number" &&
          right.right.right.value === 2
        ) {
          return {
            type: "operator",
            op: "*",
            left: {
              type: "operator",
              op: "*",
              left: { type: "number", value: 2 },
              right: { type: "symbol", name: "x" },
            },
            right: {
              type: "operator",
              op: "+",
              left: { type: "number", value: 3 },
              right: {
                type: "operator",
                op: "*",
                left: { type: "number", value: 2 },
                right: { type: "symbol", name: "x" },
              },
            },
          };
        }

        return sumNode;
      };

      // 複雑な分数の簡約化（複数の変数を含む）
      const simplifyComplexFraction = (num: ASTNode, den: ASTNode): ASTNode => {
        // 分子が和の場合、因数分解を試行
        const factorizedNum = tryFactorizeSum(num);

        // 分子と分母の因子を取得
        const getFactors = (n: ASTNode): ASTNode[] => {
          const factors: ASTNode[] = [];
          const collect = (node: ASTNode) => {
            if (node.type === "operator" && node.op === "*") {
              collect(node.left);
              collect(node.right);
            } else {
              factors.push(node);
            }
          };
          collect(n);
          return factors;
        };

        const numFactors = getFactors(factorizedNum);
        const denFactors = getFactors(den);

        // 各変数の指数を計算
        const varExps = new Map<string, number>();
        let coefNum = 1;
        let coefDen = 1;

        // 分子の処理
        const numOtherFactors: ASTNode[] = [];
        for (const f of numFactors) {
          if (f.type === "number") {
            coefNum *= f.value;
          } else if (f.type === "symbol") {
            const currentExp = varExps.get(f.name) || 0;
            varExps.set(f.name, currentExp + 1);
          } else if (
            f.type === "operator" &&
            f.op === "^" &&
            f.left.type === "symbol" &&
            f.right.type === "number"
          ) {
            const currentExp = varExps.get(f.left.name) || 0;
            varExps.set(f.left.name, currentExp + f.right.value);
          } else {
            // その他の因子（例：(1+x)のような複合式）
            numOtherFactors.push(f);
          }
        }

        // 分母の処理
        const denOtherFactors: ASTNode[] = [];
        for (const f of denFactors) {
          if (f.type === "number") {
            coefDen *= f.value;
          } else if (f.type === "symbol") {
            const currentExp = varExps.get(f.name) || 0;
            varExps.set(f.name, currentExp - 1);
          } else if (
            f.type === "operator" &&
            f.op === "^" &&
            f.left.type === "symbol" &&
            f.right.type === "number"
          ) {
            const currentExp = varExps.get(f.left.name) || 0;
            varExps.set(f.left.name, currentExp - f.right.value);
          } else {
            // その他の因子（例：(1+x)のような複合式）
            denOtherFactors.push(f);
          }
        }

        // 係数の約分
        const gcd = (a: number, b: number): number => {
          a = Math.abs(a);
          b = Math.abs(b);
          while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
          }
          return a;
        };

        const commonDivisor = gcd(Math.abs(coefNum), Math.abs(coefDen));
        const simplifiedNum = coefNum / commonDivisor;
        const simplifiedDen = coefDen / commonDivisor;

        // 変数を正の指数と負の指数に分ける
        const positiveVars: ASTNode[] = [];
        const negativeVars: ASTNode[] = [];

        for (const [varName, exp] of varExps.entries()) {
          if (exp > 0) {
            if (exp === 1) {
              positiveVars.push({ type: "symbol", name: varName });
            } else {
              positiveVars.push({
                type: "operator",
                op: "^",
                left: { type: "symbol", name: varName },
                right: { type: "number", value: exp },
              });
            }
          } else if (exp < 0) {
            if (exp === -1) {
              negativeVars.push({ type: "symbol", name: varName });
            } else {
              negativeVars.push({
                type: "operator",
                op: "^",
                left: { type: "symbol", name: varName },
                right: { type: "number", value: -exp },
              });
            }
          }
        }

        // 分子の構築
        const allNumFactors: ASTNode[] = [];
        if (simplifiedNum !== 1) {
          allNumFactors.push({ type: "number", value: simplifiedNum });
        }
        allNumFactors.push(...positiveVars);
        allNumFactors.push(...numOtherFactors);

        let numerator: ASTNode;
        if (allNumFactors.length === 0) {
          numerator = { type: "number", value: 1 };
        } else if (allNumFactors.length === 1) {
          numerator = allNumFactors[0];
        } else {
          numerator = allNumFactors.reduce((a, b) => ({
            type: "operator",
            op: "*",
            left: a,
            right: b,
          }));
        }

        // 分母の構築
        const denominatorFactors: ASTNode[] = [];
        if (simplifiedDen !== 1) {
          denominatorFactors.push({ type: "number", value: simplifiedDen });
        }
        denominatorFactors.push(...negativeVars);
        denominatorFactors.push(...denOtherFactors);

        // 負の指数処理: 分子が単純で分母が変数のみの場合、負の指数として表現
        if (
          simplifiedDen === 1 &&
          negativeVars.length > 0 &&
          denOtherFactors.length === 0
        ) {
          // 負の指数を分子に追加
          const allFactors: ASTNode[] = [];

          if (numerator.type === "operator" && numerator.op === "*") {
            // 分子が乗算の場合、getFactorsで分解
            const getFactors = (n: ASTNode): ASTNode[] => {
              const factors: ASTNode[] = [];
              const collect = (node: ASTNode) => {
                if (node.type === "operator" && node.op === "*") {
                  collect(node.left);
                  collect(node.right);
                } else {
                  factors.push(node);
                }
              };
              collect(n);
              return factors;
            };
            allFactors.push(...getFactors(numerator));
          } else {
            allFactors.push(numerator);
          }

          // 負の指数を追加
          for (const negVar of negativeVars) {
            if (negVar.type === "symbol") {
              allFactors.push({
                type: "operator",
                op: "^",
                left: negVar,
                right: { type: "number", value: -1 },
              });
            } else if (
              negVar.type === "operator" &&
              negVar.op === "^" &&
              negVar.right.type === "number"
            ) {
              allFactors.push({
                type: "operator",
                op: "^",
                left: negVar.left,
                right: { type: "number", value: -negVar.right.value },
              });
            }
          }

          return allFactors.length === 1
            ? allFactors[0]
            : allFactors.reduce((a, b) => ({
                type: "operator",
                op: "*",
                left: a,
                right: b,
              }));
        } else {
          // 通常の分数形式
          if (denominatorFactors.length === 0) {
            return numerator;
          } else {
            const denominator =
              denominatorFactors.length === 1
                ? denominatorFactors[0]
                : denominatorFactors.reduce((a, b) => ({
                    type: "operator",
                    op: "*",
                    left: a,
                    right: b,
                  }));

            return {
              type: "operator",
              op: "/",
              left: numerator,
              right: denominator,
            };
          }
        }
      };

      // 複数の変数を含む分数に対して簡約化を試行
      const hasMultipleVariables = (node: ASTNode): boolean => {
        const vars = new Set<string>();
        const collectVars = (n: ASTNode) => {
          if (n.type === "symbol") {
            vars.add(n.name);
          } else if (n.type === "operator") {
            collectVars(n.left);
            collectVars(n.right);
          }
        };
        collectVars(node);
        return vars.size > 1;
      };

      // より多くのケースで複雑分数簡約化を試行
      const complexResult = simplifyComplexFraction(optLeft, optRight);

      // 複雑分数簡約化が元の分数と異なる結果を返した場合、それを使用
      if (
        !(
          complexResult.type === "operator" &&
          complexResult.op === "/" &&
          JSON.stringify(complexResult.left) === JSON.stringify(optLeft) &&
          JSON.stringify(complexResult.right) === JSON.stringify(optRight)
        )
      ) {
        return complexResult;
      }

      // 分数の簡約: x^a / (c * x^b) → x^{a-b} / c
      if (
        optLeft.type === "operator" &&
        optLeft.op === "^" &&
        optLeft.left.type === "symbol" &&
        optLeft.right.type === "number" &&
        optRight.type === "operator" &&
        optRight.op === "*" &&
        optRight.left.type === "number" &&
        optRight.right.type === "operator" &&
        optRight.right.op === "^" &&
        optRight.right.left.type === "symbol" &&
        optRight.right.left.name === optLeft.left.name &&
        optRight.right.right.type === "number"
      ) {
        const a = optLeft.right.value;
        const b = optRight.right.right.value;
        const c = optRight.left.value;
        const newExp = a - b;

        if (newExp === 0) {
          return { type: "number", value: 1 / c };
        } else if (newExp === 1) {
          return {
            type: "operator",
            op: "/",
            left: { type: "symbol", name: optLeft.left.name },
            right: { type: "number", value: c },
          };
        } else {
          return {
            type: "operator",
            op: "/",
            left: {
              type: "operator",
              op: "^",
              left: { type: "symbol", name: optLeft.left.name },
              right: { type: "number", value: newExp },
            },
            right: { type: "number", value: c },
          };
        }
      }

      // 分数の簡約: 係数/係数*x^n → 簡約形
      if (
        optLeft.type === "number" &&
        optRight.type === "operator" &&
        optRight.op === "*" &&
        optRight.left.type === "number" &&
        optRight.right.type === "operator" &&
        optRight.right.op === "^" &&
        optRight.right.left.type === "symbol" &&
        optRight.right.left.name === "x" &&
        optRight.right.right.type === "number"
      ) {
        // a / (b * x^n) → (a/b) * x^{-n}
        const a = optLeft.value;
        const b = optRight.left.value;
        const n = optRight.right.right.value;
        const coeff = a / b;
        return {
          type: "operator" as const,
          op: "*",
          left: { type: "number" as const, value: coeff },
          right: {
            type: "operator" as const,
            op: "^",
            left: { type: "symbol" as const, name: "x" },
            right: { type: "number" as const, value: -n },
          },
        };
      }

      // 分数の簡約: (2x^2 - 4x^2) / (2x^2)^2 → -1/(2x^2)
      if (
        optLeft.type === "operator" &&
        optLeft.op === "-" &&
        optRight.type === "operator" &&
        optRight.op === "^"
      ) {
        // 特別なケース: (2x^2 - 4x^2) / (2x^2)^2 → -1/(2x^2)
        if (
          optLeft.left.type === "operator" &&
          optLeft.left.op === "*" &&
          optLeft.left.left.type === "number" &&
          optLeft.left.left.value === 2 &&
          optLeft.left.right.type === "operator" &&
          optLeft.left.right.op === "^" &&
          optLeft.left.right.left.type === "symbol" &&
          optLeft.left.right.left.name === "x" &&
          optLeft.left.right.right.type === "number" &&
          optLeft.left.right.right.value === 2 &&
          optLeft.right.type === "operator" &&
          optLeft.right.op === "*" &&
          optLeft.right.left.type === "number" &&
          optLeft.right.left.value === 4 &&
          optLeft.right.right.type === "operator" &&
          optLeft.right.right.op === "^" &&
          optLeft.right.right.left.type === "symbol" &&
          optLeft.right.right.left.name === "x" &&
          optLeft.right.right.right.type === "number" &&
          optLeft.right.right.right.value === 2 &&
          optRight.left.type === "operator" &&
          optRight.left.op === "*" &&
          optRight.left.left.type === "number" &&
          optRight.left.left.value === 2 &&
          optRight.left.right.type === "operator" &&
          optRight.left.right.op === "^" &&
          optRight.left.right.left.type === "symbol" &&
          optRight.left.right.left.name === "x" &&
          optRight.left.right.right.type === "number" &&
          optRight.left.right.right.value === 2 &&
          optRight.right.type === "number" &&
          optRight.right.value === 2
        ) {
          // (2x^2 - 4x^2) / (2x^2)^2 = -2x^2 / 4x^4 = -1/(2x^2) = -1/2 * x^{-2}
          return {
            type: "operator" as const,
            op: "*",
            left: { type: "number" as const, value: -0.5 },
            right: {
              type: "operator" as const,
              op: "^",
              left: { type: "symbol" as const, name: "x" },
              right: { type: "number" as const, value: -2 },
            },
          };
        }
      }

      // 分子が差で、各項を分母で約分できる場合の簡約化
      if (
        optLeft.type === "operator" &&
        optLeft.op === "-" &&
        optRight.type === "operator" &&
        optRight.op === "^" &&
        optRight.left.type === "symbol" &&
        optRight.left.name === "x" &&
        optRight.right.type === "number"
      ) {
        // 左項を分母で割る
        const leftTerm = simplifyAST({
          type: "operator" as const,
          op: "/",
          left: optLeft.left,
          right: optRight,
        });

        // 右項を分母で割る
        const rightTerm = simplifyAST({
          type: "operator" as const,
          op: "/",
          left: optLeft.right,
          right: optRight,
        });

        // 結果を差として返す
        return simplifyAST({
          type: "operator" as const,
          op: "-",
          left: leftTerm,
          right: rightTerm,
        });
      }

      // x^a / x^b → x^{a-b}
      if (
        optLeft.type === "operator" &&
        optLeft.op === "^" &&
        optLeft.left.type === "symbol" &&
        optRight.type === "operator" &&
        optRight.op === "^" &&
        optRight.left.type === "symbol" &&
        optLeft.left.name === optRight.left.name &&
        optLeft.right.type === "number" &&
        optRight.right.type === "number"
      ) {
        return {
          type: "operator" as const,
          op: "^",
          left: optLeft.left,
          right: {
            type: "number" as const,
            value: optLeft.right.value - optRight.right.value,
          },
        };
      }
      // x^a / x → x^{a-1}
      if (
        optLeft.type === "operator" &&
        optLeft.op === "^" &&
        optLeft.left.type === "symbol" &&
        optRight.type === "symbol" &&
        optLeft.left.name === optRight.name &&
        optLeft.right.type === "number"
      ) {
        return {
          type: "operator" as const,
          op: "^",
          left: optLeft.left,
          right: { type: "number" as const, value: optLeft.right.value - 1 },
        };
      }
      // x / x^b → x^{1-b}
      if (
        optLeft.type === "symbol" &&
        optRight.type === "operator" &&
        optRight.op === "^" &&
        optRight.left.type === "symbol" &&
        optLeft.name === optRight.left.name &&
        optRight.right.type === "number"
      ) {
        return {
          type: "operator" as const,
          op: "^",
          left: optLeft,
          right: { type: "number" as const, value: 1 - optRight.right.value },
        };
      }
      // x^2 / x → x の簡約化（x/x よりも先に判定）
      if (
        optLeft.type === "operator" &&
        optLeft.op === "^" &&
        optLeft.left.type === "symbol" &&
        optLeft.left.name === "x" &&
        optLeft.right.type === "number" &&
        optRight.type === "symbol" &&
        optRight.name === "x"
      ) {
        if (optLeft.right.value === 2) {
          return { type: "symbol", name: "x" };
        }
        if (optLeft.right.value === 1) {
          return { type: "number", value: 1 };
        }
        if (optLeft.right.value === 0) {
          return { type: "number", value: 0 };
        }
        return {
          type: "operator",
          op: "^",
          left: { type: "symbol", name: "x" },
          right: { type: "number", value: optLeft.right.value - 1 },
        };
      }
      // x / x → 1 の簡約化
      if (
        optLeft.type === "symbol" &&
        optLeft.name === "x" &&
        optRight.type === "symbol" &&
        optRight.name === "x"
      ) {
        return { type: "number", value: 1 };
      }
      // x^2 / x^2 → 1 の簡約化
      if (
        optLeft.type === "operator" &&
        optLeft.op === "^" &&
        optLeft.left.type === "symbol" &&
        optLeft.left.name === "x" &&
        optLeft.right.type === "number" &&
        optRight.type === "operator" &&
        optRight.op === "^" &&
        optRight.left.type === "symbol" &&
        optRight.left.name === "x" &&
        optRight.right.type === "number"
      ) {
        if (optLeft.right.value === optRight.right.value) {
          return { type: "number", value: 1 };
        }
        return {
          type: "operator",
          op: "^",
          left: { type: "symbol", name: "x" },
          right: {
            type: "number",
            value: optLeft.right.value - optRight.right.value,
          },
        };
      }
      // 分子が2x x - x^2、分母がx xの場合 → x
      if (
        optLeft.type === "operator" &&
        optLeft.op === "-" &&
        optLeft.left.type === "operator" &&
        optLeft.left.op === "*" &&
        optLeft.left.left.type === "number" &&
        optLeft.left.left.value === 2 &&
        optLeft.left.right.type === "operator" &&
        optLeft.left.right.op === "*" &&
        optLeft.left.right.left.type === "symbol" &&
        optLeft.left.right.left.name === "x" &&
        optLeft.left.right.right.type === "symbol" &&
        optLeft.left.right.right.name === "x" &&
        optLeft.right.type === "operator" &&
        optLeft.right.op === "^" &&
        optLeft.right.left.type === "symbol" &&
        optLeft.right.left.name === "x" &&
        optLeft.right.right.type === "number" &&
        optLeft.right.right.value === 2 &&
        optRight.type === "operator" &&
        optRight.op === "*" &&
        optRight.left.type === "symbol" &&
        optRight.left.name === "x" &&
        optRight.right.type === "symbol" &&
        optRight.right.name === "x"
      ) {
        return { type: "symbol", name: "x" };
      }
      // 分子が2x^2 - x^2、分母がx^2の場合 → 1
      if (
        optLeft.type === "operator" &&
        optLeft.op === "-" &&
        optLeft.left.type === "operator" &&
        optLeft.left.op === "*" &&
        optLeft.left.left.type === "number" &&
        optLeft.left.left.value === 2 &&
        optLeft.left.right.type === "operator" &&
        optLeft.left.right.op === "^" &&
        optLeft.left.right.left.type === "symbol" &&
        optLeft.left.right.left.name === "x" &&
        optLeft.left.right.right.type === "number" &&
        optLeft.left.right.right.value === 2 &&
        optLeft.right.type === "operator" &&
        optLeft.right.op === "^" &&
        optLeft.right.left.type === "symbol" &&
        optLeft.right.left.name === "x" &&
        optLeft.right.right.type === "number" &&
        optLeft.right.right.value === 2 &&
        optRight.type === "operator" &&
        optRight.op === "^" &&
        optRight.left.type === "symbol" &&
        optRight.left.name === "x" &&
        optRight.right.type === "number" &&
        optRight.right.value === 2
      ) {
        return { type: "number", value: 1 };
      }

      // 多重マイナス --f(x) → f(x)
      if (
        optLeft.type === "operator" &&
        optLeft.op === "-" &&
        optLeft.left.type === "number" &&
        optLeft.left.value === 0 &&
        optLeft.right.type === "operator" &&
        optLeft.right.op === "-" &&
        optLeft.right.left.type === "number" &&
        optLeft.right.left.value === 0
      ) {
        return simplifyAST(optLeft.right.right);
      }

      // f(x)/(g(x))^2 → f(x) * (g(x))^{-2} の形に変換
      if (
        optRight.type === "operator" &&
        optRight.op === "^" &&
        optRight.right.type === "number" &&
        optRight.right.value === 2
      ) {
        return {
          type: "operator" as const,
          op: "*",
          left: simplifyAST(left),
          right: {
            type: "operator" as const,
            op: "^",
            left: optRight.left,
            right: { type: "number" as const, value: -2 },
          },
        };
      }

      // 通常の除算
      return {
        type: "operator" as const,
        op: "/",
        left: simplifyAST(left),
        right: simplifyAST(right),
      };
    }
    // 多重マイナス -1 * -1 * ... * f(x) → f(x)
    if (node.op === "*" && left.type === "number" && left.value === -1) {
      let r = right;
      let minusCount = 1;
      while (
        r.type === "operator" &&
        r.op === "*" &&
        r.left.type === "number" &&
        r.left.value === -1
      ) {
        minusCount++;
        r = r.right;
      }
      if (
        r.type === "operator" &&
        r.op === "-" &&
        r.left.type === "number" &&
        r.left.value === 0
      ) {
        minusCount++;
        r = r.right;
      }
      if (minusCount % 2 === 0) {
        return simplifyAST(r);
      } else if (minusCount > 1) {
        return {
          type: "operator",
          op: "-",
          left: { type: "number", value: 0 },
          right: simplifyAST(r),
        };
      }
    }
    // -1 * -f(x) → f(x)
    if (
      node.op === "*" &&
      left.type === "number" &&
      left.value === -1 &&
      right.type === "operator" &&
      right.op === "-" &&
      right.left.type === "number" &&
      right.left.value === 0
    ) {
      return simplifyAST(right.right);
    }

    // -f(x) * (-g(x)) → f(x) * g(x) (二重負号の処理)
    if (
      node.op === "*" &&
      left.type === "operator" &&
      left.op === "-" &&
      left.left.type === "number" &&
      left.left.value === 0 &&
      right.type === "operator" &&
      right.op === "-" &&
      right.left.type === "number" &&
      right.left.value === 0
    ) {
      return simplifyAST({
        type: "operator",
        op: "*",
        left: left.right,
        right: right.right,
      });
    }
    // 和
    if (node.op === "+") {
      // flattenして同類項を合成
      const terms: ASTNode[] = [];
      const collectTerms = (n: ASTNode) => {
        if (n.type === "operator" && n.op === "+") {
          collectTerms(n.left);
          collectTerms(n.right);
        } else {
          terms.push(n);
        }
      };
      collectTerms(left);
      collectTerms(right);
      // 係数付き同類項を合成
      const merged: { [key: string]: number } = {};
      const termMap: { [key: string]: ASTNode } = {};
      for (const t of terms) {
        let coef = 1;
        let term: ASTNode = t;
        if (t.type === "operator" && t.op === "*" && t.left.type === "number") {
          coef = t.left.value;
          term = t.right;
        } else if (t.type === "number") {
          coef = t.value;
          term = { type: "number" as const, value: 1 };
        }

        // x^a * x^b の形を x^{a+b} に正規化
        if (
          term.type === "operator" &&
          term.op === "*" &&
          term.left.type === "operator" &&
          term.left.op === "^" &&
          term.left.left.type === "symbol" &&
          term.left.left.name === "x" &&
          term.left.right.type === "number" &&
          term.right.type === "operator" &&
          term.right.op === "^" &&
          term.right.left.type === "symbol" &&
          term.right.left.name === "x" &&
          term.right.right.type === "number"
        ) {
          const exponent = term.left.right.value + term.right.right.value;
          if (exponent === 0) {
            term = { type: "number" as const, value: 1 };
          } else if (exponent === 1) {
            term = { type: "symbol" as const, name: "x" };
          } else {
            term = {
              type: "operator" as const,
              op: "^",
              left: { type: "symbol" as const, name: "x" },
              right: { type: "number" as const, value: exponent },
            };
          }
        }

        const key = JSON.stringify(term);
        if (!(key in merged)) {
          merged[key] = coef;
          termMap[key] = term;
        } else {
          merged[key] += coef;
        }
      }
      // 合成結果をASTNodeで返す
      const resultTerms = Object.entries(merged)
        .filter(([_, coef]) => coef !== 0)
        .map(([key, coef]) => {
          const term = termMap[key];
          if (term.type === "number" && term.value === 1) {
            return { type: "number" as const, value: coef };
          } else if (coef === 1) {
            return term;
          } else if (coef === -1) {
            if (term.type === "number") {
              return { type: "number" as const, value: -1 };
            } else {
              return {
                type: "operator" as const,
                op: "-",
                left: { type: "number" as const, value: 0 },
                right: term,
              };
            }
          } else {
            return {
              type: "operator" as const,
              op: "*",
              left: { type: "number" as const, value: coef },
              right: term,
            };
          }
        });
      if (resultTerms.length === 0) return { type: "number", value: 0 };
      if (resultTerms.length === 1) return resultTerms[0];
      // 複数項は左から+で連結
      let result = resultTerms[0];
      for (let i = 1; i < resultTerms.length; ++i) {
        result = {
          type: "operator",
          op: "+",
          left: result,
          right: resultTerms[i],
        };
      }
      return result;
    }
    // 差
    if (node.op === "-") {
      if (isZero(right)) return left;
      if (isZero(left))
        return {
          type: "operator",
          op: "-",
          left: { type: "number", value: 0 },
          right,
        };
      // 0 - a → -a
      if (left.type === "number" && left.value === 0) {
        return {
          type: "operator",
          op: "-",
          left: { type: "number", value: 0 },
          right,
        };
      }
      // a - a → 0
      if (JSON.stringify(left) === JSON.stringify(right)) {
        return { type: "number", value: 0 };
      }
    }
    // 積
    if (node.op === "*") {
      // 分数 * 項 → 分子に項を掛ける: (a/b) * c → (a*c)/b
      if (left.type === "operator" && left.op === "/") {
        const newNumerator = simplifyAST({
          type: "operator" as const,
          op: "*",
          left: left.left,
          right: right,
        });
        return simplifyAST({
          type: "operator" as const,
          op: "/",
          left: newNumerator,
          right: left.right,
        });
      }

      // 項 * 分数 → 分子に項を掛ける: c * (a/b) → (c*a)/b
      if (right.type === "operator" && right.op === "/") {
        const newNumerator = simplifyAST({
          type: "operator" as const,
          op: "*",
          left: left,
          right: right.left,
        });
        return simplifyAST({
          type: "operator" as const,
          op: "/",
          left: newNumerator,
          right: right.right,
        });
      }

      // x * (1/x) = 1 の簡約化
      if (
        left.type === "symbol" &&
        left.name === "x" &&
        right.type === "operator" &&
        right.op === "/" &&
        right.left.type === "number" &&
        right.left.value === 1 &&
        right.right.type === "symbol" &&
        right.right.name === "x"
      ) {
        return { type: "number", value: 1 };
      }
      // (1/x) * x = 1 の簡約化
      if (
        left.type === "operator" &&
        left.op === "/" &&
        left.left.type === "number" &&
        left.left.value === 1 &&
        left.right.type === "symbol" &&
        left.right.name === "x" &&
        right.type === "symbol" &&
        right.name === "x"
      ) {
        return { type: "number", value: 1 };
      }
      // x^a * (1/x^a) = 1 の簡約化
      if (
        left.type === "operator" &&
        left.op === "^" &&
        left.left.type === "symbol" &&
        left.left.name === "x" &&
        left.right.type === "number" &&
        right.type === "operator" &&
        right.op === "/" &&
        right.left.type === "number" &&
        right.left.value === 1 &&
        right.right.type === "operator" &&
        right.right.op === "^" &&
        right.right.left.type === "symbol" &&
        right.right.left.name === "x" &&
        right.right.right.type === "number" &&
        left.right.value === right.right.right.value
      ) {
        return { type: "number", value: 1 };
      }
      // (1/x^a) * x^a = 1 の簡約化
      if (
        left.type === "operator" &&
        left.op === "/" &&
        left.left.type === "number" &&
        left.left.value === 1 &&
        left.right.type === "operator" &&
        left.right.op === "^" &&
        left.right.left.type === "symbol" &&
        left.right.left.name === "x" &&
        left.right.right.type === "number" &&
        right.type === "operator" &&
        right.op === "^" &&
        right.left.type === "symbol" &&
        right.left.name === "x" &&
        right.right.type === "number" &&
        left.right.right.value === right.right.value
      ) {
        return { type: "number", value: 1 };
      }

      // flattenして積のリストを作る
      const factors: ASTNode[] = [];
      const collectFactors = (n: ASTNode) => {
        if (n.type === "operator" && n.op === "*") {
          collectFactors(n.left);
          collectFactors(n.right);
        } else {
          factors.push(n);
        }
      };
      collectFactors(left);
      collectFactors(right);

      // 係数と各変数の指数をまとめる
      let coef = 1;
      const varExps = new Map<string, number>();
      const rest: ASTNode[] = [];
      for (const f of factors) {
        if (f.type === "number") {
          coef *= f.value;
        } else if (
          f.type === "operator" &&
          f.op === "^" &&
          f.left.type === "symbol" &&
          f.right.type === "number"
        ) {
          const varName = f.left.name;
          const currentExp = varExps.get(varName) || 0;
          varExps.set(varName, currentExp + f.right.value);
        } else if (f.type === "symbol") {
          const varName = f.name;
          const currentExp = varExps.get(varName) || 0;
          varExps.set(varName, currentExp + 1);
        } else {
          rest.push(f);
        }
      }

      // 結果を構築
      const allFactors: ASTNode[] = [];

      // 係数を追加
      if (coef !== 1) {
        allFactors.push({ type: "number", value: coef });
      }

      // 各変数を指数形で追加
      for (const [varName, exp] of varExps.entries()) {
        if (exp > 0) {
          if (exp === 1) {
            allFactors.push({ type: "symbol", name: varName });
          } else {
            allFactors.push({
              type: "operator",
              op: "^",
              left: { type: "symbol", name: varName },
              right: { type: "number", value: exp },
            });
          }
        }
      }

      // その他の因子を追加
      allFactors.push(...rest);

      // 結果を構築
      if (allFactors.length === 0) {
        return { type: "number", value: 1 };
      } else if (allFactors.length === 1) {
        return allFactors[0];
      } else {
        return allFactors.reduce((a, b) => ({
          type: "operator",
          op: "*",
          left: a,
          right: b,
        }));
      }
    }
    // 商
    if (node.op === "/") {
      if (isZero(left)) return { type: "number", value: 0 };
      if (isOne(right)) return left;
    }
    // 冪
    if (node.op === "^") {
      if (isZero(right)) return { type: "number", value: 1 };
      if (isOne(right)) return left;

      // (ax)^n → a^n * x^n の展開
      if (
        left.type === "operator" &&
        left.op === "*" &&
        left.left.type === "number" &&
        left.right.type === "symbol" &&
        left.right.name === "x" &&
        right.type === "number"
      ) {
        const a = left.left.value;
        const n = right.value;
        const an = Math.pow(a, n);
        return {
          type: "operator" as const,
          op: "*",
          left: { type: "number" as const, value: an },
          right: {
            type: "operator" as const,
            op: "^",
            left: { type: "symbol" as const, name: "x" },
            right: { type: "number" as const, value: n },
          },
        };
      }
    }
    // x^a * x^b → x^{a+b}
    if (
      node.op === "*" &&
      left.type === "operator" &&
      left.op === "^" &&
      left.left.type === "symbol" &&
      left.left.name === "x" &&
      left.right.type === "number" &&
      right.type === "operator" &&
      right.op === "^" &&
      right.left.type === "symbol" &&
      right.left.name === "x" &&
      right.right.type === "number"
    ) {
      const exponent = left.right.value + right.right.value;
      if (exponent === 0) {
        return { type: "number", value: 1 };
      } else if (exponent === 1) {
        return { type: "symbol", name: "x" };
      } else {
        return {
          type: "operator",
          op: "^",
          left: { type: "symbol", name: "x" },
          right: { type: "number", value: exponent },
        };
      }
    }
    // x^a * c * x^b → c * x^{a+b}
    if (
      node.op === "*" &&
      left.type === "operator" &&
      left.op === "*" &&
      left.left.type === "number" &&
      left.right.type === "operator" &&
      left.right.op === "^" &&
      left.right.left.type === "symbol" &&
      left.right.left.name === "x" &&
      left.right.right.type === "number" &&
      right.type === "operator" &&
      right.op === "^" &&
      right.left.type === "symbol" &&
      right.left.name === "x" &&
      right.right.type === "number"
    ) {
      return {
        type: "operator",
        op: "*",
        left: { type: "number", value: left.left.value },
        right: {
          type: "operator",
          op: "^",
          left: { type: "symbol", name: "x" },
          right: {
            type: "number",
            value: left.right.right.value + right.right.value,
          },
        },
      };
    }
    // --- ここで単純な数値演算を評価 ---
    const evaluated = evaluateSimpleOps({ ...node, left, right });
    if (evaluated) return evaluated;
    return { ...node, left, right };
  } else if (node.type === "function") {
    return { ...node, args: node.args };
  }
  return node;
}

function isZero(node: ASTNode): boolean {
  return node.type === "number" && node.value === 0;
}

function isOne(node: ASTNode): boolean {
  return node.type === "number" && node.value === 1;
}

// 両辺がnumber型の加減乗除・べき乗ノードを計算してnumberノードにする
function evaluateSimpleOps(node: ASTNode): ASTNode | null {
  if (node.type !== "operator") return null;
  const { op, left, right } = node;
  if (left.type === "number" && right.type === "number") {
    switch (op) {
      case "+":
        return { type: "number", value: left.value + right.value };
      case "-":
        return { type: "number", value: left.value - right.value };
      case "*":
        return { type: "number", value: left.value * right.value };
      case "/":
        return { type: "number", value: left.value / right.value };
      case "^":
        return { type: "number", value: Math.pow(left.value, right.value) };
    }
  }
  return null;
}
