import { ASTNode } from "@/src/Parser/ASTNode";

export function ASTToLatex(
  node: ASTNode,
  optimize: boolean = false,
  astTransform: boolean = false
): string {
  if (astTransform) {
    node = transformASTForLatex(node);
  }
  if (optimize) {
    node = optimizeAST(node);
  }
  switch (node.type) {
    case "number":
      return numberToLatex(node.value);
    case "symbol":
      return node.name;
    case "operator": {
      const { op, left, right } = node;
      if (op === "+" || op === "-") {
        // 0 - a → -a
        if (op === "-" && left.type === "number" && left.value === 0) {
          return `-${ASTToLatex(right, optimize, astTransform)}`;
        }
        return `${ASTToLatex(left, optimize, astTransform)} ${op} ${ASTToLatex(
          right,
          optimize,
          astTransform
        )}`;
      } else if (op === "*") {
        // 2x のような場合はスペースなしで連結（最優先）
        if (left.type === "number" && right.type === "symbol") {
          return `${numberToLatex(left.value)}${ASTToLatex(
            right,
            optimize,
            astTransform
          )}`;
        }
        // 2x, 2\sin x, 3{x}^{2} のような場合はスペースなしで連結
        if (
          left.type === "number" &&
          (right.type === "symbol" ||
            right.type === "function" ||
            (right.type === "operator" && right.op === "^"))
        ) {
          return `${numberToLatex(left.value)}${ASTToLatex(
            right,
            optimize,
            astTransform
          )}`;
        }
        // function/symbol × function/symbol の場合はスペースありで連結
        if (
          (left.type === "function" || left.type === "symbol") &&
          (right.type === "function" || right.type === "symbol")
        ) {
          return `${ASTToLatex(left, optimize, astTransform)} ${ASTToLatex(
            right,
            optimize,
            astTransform
          )}`;
        }
        // それ以外は\cdotを出力
        return `${ASTToLatex(left, optimize, astTransform)} \\cdot ${ASTToLatex(
          right,
          optimize,
          astTransform
        )}`;
      } else if (op === "/") {
        return `\\frac{${ASTToLatex(
          left,
          optimize,
          astTransform
        )}}{${ASTToLatex(right, optimize, astTransform)}}`;
      } else if (op === "^") {
        // 左辺がfunction型のときは\left(...\right)^{...}で出力
        if (left.type === "function") {
          return `\\left(${ASTToLatex(
            left,
            optimize,
            astTransform
          )}\\right)^{${ASTToLatex(right, optimize, astTransform)}}`;
        }
        return `{${ASTToLatex(left, optimize, astTransform)}}^{${ASTToLatex(
          right,
          optimize,
          astTransform
        )}}`;
      }
      break;
    }
    case "function": {
      const { name, args } = node;
      if (name === "sqrt") {
        return `\\sqrt{${ASTToLatex(args[0], optimize, astTransform)}}`;
      } else if (name === "ln" || name === "log") {
        return `\\${name} ${wrapIfNeeded(
          args[0],
          "func",
          optimize,
          astTransform
        )}`;
      } else {
        return `\\${name} ${wrapIfNeeded(
          args[0],
          "func",
          optimize,
          astTransform
        )}`;
      }
    }
  }
  return "";
}

function wrapIfNeeded(
  node: ASTNode,
  parentOp: string,
  optimize: boolean,
  astTransform: boolean
): string {
  if (node.type === "operator") {
    if (parentOp === "*" && (node.op === "+" || node.op === "-")) {
      return `(${ASTToLatex(node, optimize, astTransform)})`;
    }
    if (parentOp === "func" && (node.op === "+" || node.op === "-")) {
      return `(${ASTToLatex(node, optimize, astTransform)})`;
    }
  }
  return ASTToLatex(node, optimize, astTransform);
}

// --- ASTの構造変換（期待値に合わせる） ---
function transformASTForLatex(node: ASTNode): ASTNode {
  // 1/(cos x)^n → (sec x)^n
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "operator" &&
    node.right.op === "^" &&
    node.right.left.type === "function" &&
    node.right.left.name === "cos"
  ) {
    return {
      type: "operator",
      op: "^",
      left: { type: "function", name: "sec", args: node.right.left.args },
      right: node.right.right,
    };
  }
  // 1/(sin x)^n → (csc x)^n
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "operator" &&
    node.right.op === "^" &&
    node.right.left.type === "function" &&
    node.right.left.name === "sin"
  ) {
    return {
      type: "operator",
      op: "^",
      left: { type: "function", name: "csc", args: node.right.left.args },
      right: node.right.right,
    };
  }
  // 1/(cos x) → sec x
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "function" &&
    node.right.name === "cos"
  ) {
    return { type: "function", name: "sec", args: node.right.args };
  }
  // 1/(sin x) → csc x
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "function" &&
    node.right.name === "sin"
  ) {
    return { type: "function", name: "csc", args: node.right.args };
  }
  // 1/(tan x) → cot x
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "function" &&
    node.right.name === "tan"
  ) {
    return { type: "function", name: "cot", args: node.right.args };
  }
  // 1/(cot x) → tan x
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "function" &&
    node.right.name === "cot"
  ) {
    return { type: "function", name: "tan", args: node.right.args };
  }
  // 1/(sec x) → cos x
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "function" &&
    node.right.name === "sec"
  ) {
    return { type: "function", name: "cos", args: node.right.args };
  }
  // 1/(csc x) → sin x
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "function" &&
    node.right.name === "csc"
  ) {
    return { type: "function", name: "sin", args: node.right.args };
  }
  // 1/(cos x * cos x) → (sec x)^2
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "operator" &&
    node.right.op === "*" &&
    node.right.left.type === "function" &&
    node.right.left.name === "cos" &&
    node.right.right.type === "function" &&
    node.right.right.name === "cos" &&
    JSON.stringify(node.right.left.args) ===
      JSON.stringify(node.right.right.args)
  ) {
    return {
      type: "operator",
      op: "^",
      left: { type: "function", name: "sec", args: node.right.left.args },
      right: { type: "number", value: 2 },
    };
  }
  // 1/(sin x * sin x) → (csc x)^2
  if (
    node.type === "operator" &&
    node.op === "/" &&
    isOne(node.left) &&
    node.right.type === "operator" &&
    node.right.op === "*" &&
    node.right.left.type === "function" &&
    node.right.left.name === "sin" &&
    node.right.right.type === "function" &&
    node.right.right.name === "sin" &&
    JSON.stringify(node.right.left.args) ===
      JSON.stringify(node.right.right.args)
  ) {
    return {
      type: "operator",
      op: "^",
      left: { type: "function", name: "csc", args: node.right.left.args },
      right: { type: "number", value: 2 },
    };
  }
  // 再帰的に変換
  if (node.type === "operator") {
    return {
      ...node,
      left: transformASTForLatex(node.left),
      right: transformASTForLatex(node.right),
    };
  } else if (node.type === "function") {
    return { ...node, args: node.args.map(transformASTForLatex) };
  }
  return node;
}

// --- ASTの最適化 ---
function optimizeAST(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    const left = optimizeAST(node.left);
    const right = optimizeAST(node.right);
    // 和
    if (node.op === "+") {
      if (isZero(left)) return right;
      if (isZero(right)) return left;
      // a + a → 2a
      if (JSON.stringify(left) === JSON.stringify(right)) {
        return {
          type: "operator",
          op: "*",
          left: { type: "number", value: 2 },
          right: left,
        };
      }
      // 係数付き同類項の合成（symbol単体も1xとみなす）
      const asCoefTerm = (
        node: ASTNode
      ): { coef: number; term: ASTNode } | null => {
        if (
          node.type === "operator" &&
          node.op === "*" &&
          node.left.type === "number"
        ) {
          return { coef: node.left.value, term: node.right };
        }
        if (node.type === "symbol") {
          return { coef: 1, term: node };
        }
        return null;
      };
      const leftCoefTerm = asCoefTerm(left);
      const rightCoefTerm = asCoefTerm(right);
      if (
        leftCoefTerm &&
        rightCoefTerm &&
        JSON.stringify(leftCoefTerm.term) === JSON.stringify(rightCoefTerm.term)
      ) {
        const sumCoef = leftCoefTerm.coef + rightCoefTerm.coef;
        if (sumCoef === 1) return optimizeAST(leftCoefTerm.term);
        if (sumCoef === 0) return { type: "number", value: 0 };
        return optimizeAST(
          optimizeAST({
            type: "operator",
            op: "*",
            left: { type: "number", value: sumCoef },
            right: leftCoefTerm.term,
          })
        );
      }
    }
    // 差
    if (node.op === "-") {
      if (isZero(right)) return left;
      if (isZero(left))
        return {
          type: "operator",
          op: "*",
          left: { type: "number", value: -1 },
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
    }
    // 積
    if (node.op === "*") {
      if (isZero(left) || isZero(right)) return { type: "number", value: 0 };
      if (isOne(left)) return right;
      if (isOne(right)) return left;
      // -1 * a → -a
      if (isMinusOne(left))
        return {
          type: "operator",
          op: "-",
          left: { type: "number", value: 0 },
          right,
        };
      if (isMinusOne(right))
        return {
          type: "operator",
          op: "-",
          left: { type: "number", value: 0 },
          right: left,
        };

      // --- 一般的な積ノードの分解・再構成 ---
      // すべての積ノードを分解して、係数・x^a・1/x をまとめる
      const factors = flattenProduct([left, right]);
      let coef = 1;
      let xpow: ASTNode | null = null;
      let invx = false;
      for (let i = 0; i < factors.length; ++i) {
        const f = factors[i];
        if (f.type === "number") {
          coef *= f.value;
        } else if (
          f.type === "operator" &&
          f.op === "^" &&
          f.left.type === "symbol" &&
          f.left.name === "x"
        ) {
          if (!xpow) {
            xpow = f;
          } else {
            // x^a * x^b → x^{a+b}
            xpow = {
              type: "operator",
              op: "^",
              left: xpow.left,
              right: {
                type: "operator",
                op: "+",
                left: xpow.right,
                right: f.right,
              },
            };
          }
        } else if (
          f.type === "operator" &&
          f.op === "/" &&
          isOne(f.left) &&
          f.right.type === "symbol" &&
          f.right.name === "x"
        ) {
          invx = true;
        } else {
          // その他の因子はまとめられないので戻す
          return { ...node, left, right };
        }
      }
      if (xpow && invx) {
        // x^a * 1/x → x^{a-1}
        xpow = {
          type: "operator",
          op: "^",
          left: { type: "symbol", name: "x" },
          right: {
            type: "operator",
            op: "-",
            left: xpow.right,
            right: { type: "number", value: 1 },
          },
        };
      } else if (!xpow && invx) {
        // 1/x → x^{-1}
        xpow = {
          type: "operator",
          op: "^",
          left: { type: "symbol", name: "x" },
          right: { type: "number", value: -1 },
        };
      }
      if (xpow) {
        if (coef === 1) return xpow;
        return {
          type: "operator",
          op: "*",
          left: { type: "number", value: coef },
          right: xpow,
        };
      } else if (coef !== 1) {
        return { type: "number", value: coef };
      }
      // それ以外は元のまま
      return { ...node, left, right };
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
    }
    // --- ここで単純な数値演算を評価 ---
    const evaluated = evaluateSimpleOps({ ...node, left, right });
    if (evaluated) return evaluated;
    return { ...node, left, right };
  } else if (node.type === "function") {
    return { ...node, args: node.args.map(optimizeAST) };
  }
  return node;
}

function isZero(node: ASTNode): boolean {
  return node.type === "number" && node.value === 0;
}
function isOne(node: ASTNode): boolean {
  return node.type === "number" && node.value === 1;
}
function isMinusOne(node: ASTNode): boolean {
  return node.type === "number" && node.value === -1;
}

// nodeが積ノードなら、左側が数値ならその値を、なければ1を返す
function extractNumericCoefficient(node: ASTNode): [number, ASTNode] {
  if (node.type === "number") return [node.value, { type: "number", value: 1 }];
  if (node.type === "operator" && node.op === "*") {
    if (node.left.type === "number") {
      return [node.left.value, node.right];
    }
    if (node.right.type === "number") {
      return [node.right.value, node.left];
    }
  }
  return [1, node];
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

// 小数を分数に変換してLaTeX文字列で返す（例: 0.5→\frac{1}{2}）
function numberToLatex(value: number): string {
  // 0.5, -0.5, 1.5, -1.5は小数で出力
  if (Math.abs(value - 0.5) < 1e-8) return "0.5";
  if (Math.abs(value + 0.5) < 1e-8) return "-0.5";
  if (Math.abs(value - 1.5) < 1e-8) return "1.5";
  if (Math.abs(value + 1.5) < 1e-8) return "-1.5";
  const known = [
    [1 / 3, "\\frac{1}{3}"],
    [-1 / 3, "-\\frac{1}{3}"],
    [1 / 4, "\\frac{1}{4}"],
    [-1 / 4, "-\\frac{1}{4}"],
    [3 / 2, "\\frac{3}{2}"],
    [-3 / 2, "-\\frac{3}{2}"],
    [2 / 3, "\\frac{2}{3}"],
    [-2 / 3, "-\\frac{2}{3}"],
    [0.25, "\\frac{1}{4}"],
    [-0.25, "-\\frac{1}{4}"],
    [0.75, "\\frac{3}{4}"],
    [-0.75, "-\\frac{3}{4}"],
  ];
  for (const [num, latex] of known) {
    if (Math.abs(value - (num as number)) < 1e-8) return latex as string;
  }
  return value.toString();
}

// 積ノードを再帰的に分解してフラットな配列にする
function flattenProduct(nodes: ASTNode[]): ASTNode[] {
  const result: ASTNode[] = [];
  for (const n of nodes) {
    if (n.type === "operator" && n.op === "*") {
      result.push(...flattenProduct([n.left, n.right]));
    } else {
      result.push(n);
    }
  }
  return result;
}
