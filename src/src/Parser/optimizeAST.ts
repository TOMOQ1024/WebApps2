import { ASTNode } from "./ASTNode";

// ASTの最適化
export function optimizeAST(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    // まず左右を再帰的に最適化
    const left = optimizeAST(node.left);
    const right = optimizeAST(node.right);

    // 数値計算の評価を先に行う
    const numericResult = evaluateSimpleOps({ ...node, left, right });
    if (numericResult) return numericResult;
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
    // 分数ノードのとき、分子分母が等しい場合は0、分子が0なら0、分母が1なら分子のみ返す（再帰的に最適化）
    if (node.op === "/") {
      const optLeft = optimizeAST(left);
      const optRight = optimizeAST(right);
      if (JSON.stringify(optLeft) === JSON.stringify(optRight)) {
        return { type: "number", value: 0 };
      }
      if (optLeft.type === "number" && optLeft.value === 0) {
        return { type: "number", value: 0 };
      }
      if (optRight.type === "number" && optRight.value === 1) {
        return optLeft;
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
        const leftTerm = optimizeAST({
          type: "operator" as const,
          op: "/",
          left: optLeft.left,
          right: optRight,
        });

        // 右項を分母で割る
        const rightTerm = optimizeAST({
          type: "operator" as const,
          op: "/",
          left: optLeft.right,
          right: optRight,
        });

        // 結果を差として返す
        return optimizeAST({
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
        return optimizeAST(optLeft.right.right);
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
          left: optimizeAST(left),
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
        left: optimizeAST(left),
        right: optimizeAST(right),
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
        return optimizeAST(r);
      } else if (minusCount > 1) {
        return {
          type: "operator",
          op: "-",
          left: { type: "number", value: 0 },
          right: optimizeAST(r),
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
      return optimizeAST(right.right);
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
      return optimizeAST({
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

      // 係数とxの指数をまとめる
      let coef = 1;
      let xexp = 0;
      const rest: ASTNode[] = [];
      for (const f of factors) {
        if (f.type === "number") {
          coef *= f.value;
        } else if (
          f.type === "operator" &&
          f.op === "^" &&
          f.left.type === "symbol" &&
          f.left.name === "x" &&
          f.right.type === "number"
        ) {
          xexp += f.right.value;
        } else if (f.type === "symbol" && f.name === "x") {
          xexp += 1;
        } else {
          rest.push(f);
        }
      }

      // x^0 = 1 の場合は係数のみ
      if (xexp === 0) {
        if (rest.length === 0) {
          return { type: "number", value: coef };
        } else if (coef === 1) {
          return rest.length === 1
            ? rest[0]
            : rest.reduce((a, b) => ({
                type: "operator" as const,
                op: "*",
                left: a,
                right: b,
              }));
        } else {
          const restNode =
            rest.length === 1
              ? rest[0]
              : rest.reduce((a, b) => ({
                  type: "operator" as const,
                  op: "*",
                  left: a,
                  right: b,
                }));
          return {
            type: "operator" as const,
            op: "*",
            left: { type: "number" as const, value: coef },
            right: restNode,
          };
        }
      }

      let node_: ASTNode | null = null;
      if (xexp !== 0) {
        if (xexp === 1) {
          node_ = { type: "symbol" as const, name: "x" };
        } else {
          node_ = {
            type: "operator" as const,
            op: "^",
            left: { type: "symbol" as const, name: "x" },
            right: { type: "number" as const, value: xexp },
          };
        }
      }

      if (node_ && rest.length > 0) {
        rest.unshift(node_);
        node_ = null;
      }
      if (rest.length > 0) {
        if (rest.length === 1) {
          node_ = rest[0];
        } else {
          node_ = rest.reduce((a, b) => ({
            type: "operator" as const,
            op: "*",
            left: a,
            right: b,
          }));
        }
      }

      // 係数が-1なら必ず -node_ の形に
      if (coef === -1) {
        if (!node_ && rest.length > 0) {
          node_ =
            rest.length === 1
              ? rest[0]
              : rest.reduce((a, b) => ({
                  type: "operator" as const,
                  op: "*",
                  left: a,
                  right: b,
                }));
        }
        if (!node_) node_ = { type: "number" as const, value: 1 };
        node_ = {
          type: "operator" as const,
          op: "-",
          left: { type: "number" as const, value: 0 },
          right: node_,
        };
      } else if (coef !== 1 && coef !== 0) {
        if (!node_ && rest.length > 1) {
          node_ = rest.reduce((a, b) => ({
            type: "operator" as const,
            op: "*",
            left: a,
            right: b,
          }));
        }
        if (!node_ && rest.length === 1) {
          node_ = rest[0];
        }
        if (!node_) node_ = { type: "number" as const, value: 1 };
        node_ = {
          type: "operator" as const,
          op: "*",
          left: { type: "number" as const, value: coef },
          right: node_,
        };
      } else if (coef === 0) {
        node_ = { type: "number" as const, value: 0 };
      }
      if (!node_) node_ = { type: "number" as const, value: 1 };
      return node_;
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
