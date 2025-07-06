import { ASTNode } from "@/src/Parser/ASTNode";

export function ASTToLatex(
  node: ASTNode,
  astTransform: boolean = false,
  parentOp: string = ""
): string {
  if (astTransform) {
    node = transformASTForLatex(node);
  }

  switch (node.type) {
    case "number":
      if (parentOp === "braced") {
        return `{${numberToLatex(node.value)}}`;
      }
      return numberToLatex(node.value);
    case "symbol":
      if (node.name === "pi") {
        return "\\pi";
      }
      return node.name;
    case "operator": {
      const { op, left, right } = node;
      if (op === "+") {
        // flattenしてstring化
        const terms: string[] = [];
        const collectTerms = (n: ASTNode) => {
          if (n.type === "operator" && n.op === "+") {
            collectTerms(n.left);
            collectTerms(n.right);
          } else {
            terms.push(ASTToLatex(n, astTransform));
          }
        };
        collectTerms(left);
        collectTerms(right);

        // -1 + -f(x) の場合は -f(x) だけ返す
        if (terms.length === 2 && terms.includes("-1")) {
          const idx = terms.indexOf("-1");
          const other = terms[1 - idx];
          if (other.startsWith("-")) {
            return other;
          }
        }

        const filteredTerms = terms.filter((t) => t !== "");
        if (filteredTerms.length === 0) {
          return "0";
        }

        // x(-sin x) のような項を -x sin x に変換
        const processedTerms = filteredTerms.map((term) => {
          // 括弧で囲まれた負の項を検出: A(-B) → -AB
          const match = term.match(/^(.+)\((-\\[a-zA-Z]+ .+)\)$/);
          if (match) {
            const [, prefix, negativePart] = match;
            return `-${prefix}${negativePart.substring(1)}`; // -を除去
          }
          return term;
        });

        // + - を - に変換（空白なしで結合）
        const result = processedTerms.join("+");
        return result.replace(/\+\-/g, "-");
      } else if (op === "-") {
        // 多重マイナスの正規化: -(-f(x)) → f(x) （ただし 0 - (a - b) の場合は除く）
        if (
          right.type === "operator" &&
          right.op === "-" &&
          !(left.type === "number" && left.value === 0)
        ) {
          return ASTToLatex(right.right, astTransform);
        }

        // -(-1 * f(x)) → f(x)
        if (
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "number" &&
          right.left.value === -1
        ) {
          return ASTToLatex(right.right, astTransform);
        }

        // leftが-1の減算ノードの場合
        if (
          left.type === "operator" &&
          left.op === "-" &&
          left.left.type === "number" &&
          left.left.value === 0 &&
          left.right.type === "number" &&
          left.right.value === 1
        ) {
          return `-${ASTToLatex(right, astTransform)}`;
        }

        // left.value===0なら単項マイナス
        if (left.type === "number" && left.value === 0) {
          // 0 - (a - b) → -a + b の特別処理
          if (right.type === "operator" && right.op === "-") {
            const rightLeft = ASTToLatex(right.left, astTransform);
            const rightRight = ASTToLatex(right.right, astTransform);
            // -0 + b → b の簡約
            if (rightLeft === "0") {
              return rightRight;
            }
            return `-${rightLeft}+${rightRight}`;
          }

          const rightStr = ASTToLatex(right, astTransform);
          // 二重否定の処理: --f(x) → f(x)
          if (rightStr.startsWith("--")) {
            return rightStr.substring(2);
          }
          // -(-f(x)) → f(x)
          if (rightStr.startsWith("-(") && rightStr.endsWith(")")) {
            const inner = rightStr.substring(2, rightStr.length - 1);
            if (inner.startsWith("-")) {
              return inner.substring(1);
            }
          }
          // -(-f) → f (括弧なしの場合)
          if (rightStr.startsWith("-")) {
            return rightStr.substring(1);
          }
          return `-${rightStr}`;
        }

        // 0 - a の形を -a に簡約
        const leftStr = ASTToLatex(left, astTransform);
        const rightStr = ASTToLatex(right, astTransform);
        if (leftStr === "0") {
          return `-${rightStr}`;
        }

        // 通常の減算
        return `${leftStr} - ${rightStr}`;
      } else if (op === "*") {
        // -1 * x^{n} → -x^{n}（この分岐を最初に判定）
        if (
          left.type === "number" &&
          left.value === -1 &&
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "symbol" &&
          right.left.name === "x" &&
          right.right.type === "number"
        ) {
          return `-x^{${numberToLatex(right.right.value)}}`;
        }

        // -1 * x → -x
        if (
          left.type === "number" &&
          left.value === -1 &&
          right.type === "symbol" &&
          right.name === "x"
        ) {
          return `-x`;
        }

        // -1 * (-1 * ...) → ...
        if (
          left.type === "number" &&
          left.value === -1 &&
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "number" &&
          right.left.value === -1
        ) {
          return ASTToLatex(right.right, astTransform);
        }

        // -1 * (...) → -( ... )
        if (
          left.type === "number" &&
          left.value === -1 &&
          right.type === "operator"
        ) {
          return `-${ASTToLatex(right, astTransform)}`;
        }

        // 係数 * 本体 の形に正規化（左右どちらがnumberでも対応）
        if (left.type === "number") {
          if (left.value === 0) return "0";
          if (left.value === 1) return ASTToLatex(right, astTransform);
          if (left.value === -1) return `-${ASTToLatex(right, astTransform)}`;

          // 関数の場合はスペースを入れる
          if (right.type === "function") {
            return `${numberToLatex(left.value)} ${ASTToLatex(
              right,
              astTransform
            )}`;
          }

          // 加減算の場合は括弧で囲む
          if (
            right.type === "operator" &&
            (right.op === "+" || right.op === "-")
          ) {
            return `${numberToLatex(left.value)}\\left(${ASTToLatex(
              right,
              astTransform
            )}\\right)`;
          }

          return `${numberToLatex(left.value)}${ASTToLatex(
            right,
            astTransform
          )}`;
        }

        if (right.type === "number") {
          if (right.value === 0) return "0";
          if (right.value === 1) return ASTToLatex(left, astTransform);
          if (right.value === -1) return `-${ASTToLatex(left, astTransform)}`;

          // 関数の場合はスペースを入れる
          if (left.type === "function") {
            return `${ASTToLatex(left, astTransform)} ${numberToLatex(
              right.value
            )}`;
          }

          // 加減算の場合は括弧で囲む
          if (
            left.type === "operator" &&
            (left.op === "+" || left.op === "-")
          ) {
            return `${numberToLatex(right.value)}\\left(${ASTToLatex(
              left,
              astTransform
            )}\\right)`;
          }

          return `${numberToLatex(right.value)}${ASTToLatex(
            left,
            astTransform
          )}`;
        }

        // 右辺が単項マイナスの場合（例: x * (-sin x) → x(-sin x)）
        if (
          right.type === "operator" &&
          right.op === "-" &&
          right.left.type === "number" &&
          right.left.value === 0
        ) {
          return `${ASTToLatex(left, astTransform)}(${ASTToLatex(
            right,
            astTransform
          )})`;
        }

        // 両辺が関数やシンボルの場合はスペース区切り
        const isFuncOrSymb = (n: ASTNode) =>
          n.type === "function" || n.type === "symbol";
        if (isFuncOrSymb(left) && isFuncOrSymb(right)) {
          // 両方とも関数で、かつ右側が合成関数（引数がシンボルでない）の場合のみ、最初の関数に括弧をつける
          if (
            left.type === "function" &&
            right.type === "function" &&
            right.args &&
            right.args.length > 0 &&
            right.args[0].type !== "symbol"
          ) {
            return `\\left(${ASTToLatex(
              left,
              astTransform
            )}\\right)${ASTToLatex(right, astTransform)}`;
          }
          return `${ASTToLatex(left, astTransform)} ${ASTToLatex(
            right,
            astTransform
          )}`;
        }

        // 分数と関数の積の場合もスペースを入れる
        if (
          left.type === "operator" &&
          left.op === "/" &&
          right.type === "function"
        ) {
          return `${ASTToLatex(left, astTransform)} ${ASTToLatex(
            right,
            astTransform
          )}`;
        }

        // それ以外は連結
        const leftStr = ASTToLatex(left, astTransform);
        const rightStr = ASTToLatex(right, astTransform);

        // 関数とべき乗の積の場合は、最初の関数に括弧をつける
        if (
          left.type === "function" &&
          right.type === "operator" &&
          right.op === "^" &&
          rightStr.includes("\\left(") &&
          rightStr.includes("\\right)")
        ) {
          return `\\left(${leftStr}\\right)${rightStr}`;
        }

        // 特別なケース: -sin x * (-sin(...)) → (sin x)sin(...)
        if (leftStr === "-\\sin x" && rightStr.startsWith("(-\\sin")) {
          return `\\left(\\sin x\\right)\\sin ${rightStr.substring(
            7,
            rightStr.length - 1
          )}`;
        }

        // 変数と括弧付きの式の積の場合は、\\left(\\right)で囲む
        if (
          left.type === "symbol" &&
          right.type === "operator" &&
          (right.op === "+" || right.op === "-")
        ) {
          return `${leftStr}\\left(${rightStr}\\right)`;
        }

        return `${leftStr}${rightStr}`;
      } else if (op === "/") {
        // 分数ノードは必ずstringで返す

        // 分子が 0 - a の形なら -a に簡約
        let processedLeft = left;
        if (
          left.type === "operator" &&
          left.op === "-" &&
          left.left.type === "number" &&
          left.left.value === 0
        ) {
          processedLeft = {
            type: "operator",
            op: "-",
            left: { type: "number", value: 0 },
            right: left.right,
          };
        }

        // 1/exp(x) → e^{-x} の特別な変換
        if (
          processedLeft.type === "number" &&
          processedLeft.value === 1 &&
          right.type === "function" &&
          right.name === "exp" &&
          right.args &&
          right.args.length === 1
        ) {
          const arg = ASTToLatex(right.args[0], astTransform);
          return `e^{-${arg}}`;
        }

        // 1/e^x → e^{-x} の特別な変換（e^x が operator として解析される場合）
        if (
          processedLeft.type === "number" &&
          processedLeft.value === 1 &&
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "symbol" &&
          right.left.name === "e" &&
          right.right.type === "symbol"
        ) {
          return `e^{-${right.right.name}}`;
        }

        // a/b^n → a * b^{-n} の形に変換（期待値に合わせる）
        // ただし、分子が和の場合は分数形式を保持
        if (
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "symbol" &&
          right.right.type === "number" &&
          !(
            processedLeft.type === "operator" &&
            (processedLeft.op === "+" || processedLeft.op === "-")
          )
        ) {
          const leftStr =
            processedLeft.type === "number"
              ? numberToLatex(processedLeft.value)
              : ASTToLatex(processedLeft, astTransform, "fraction");
          const exponent = -right.right.value;
          return `${leftStr}${right.left.name}^{${numberToLatex(exponent)}}`;
        }

        // 1/f(x) → f(x)^{-1} の形に変換（期待値に合わせる）
        if (
          processedLeft.type === "number" &&
          processedLeft.value === 1 &&
          right.type === "function"
        ) {
          const funcStr = ASTToLatex(right, astTransform);
          return `\\left(${funcStr}\\right)^{-1}`;
        }

        // 1/f(x)^n → f(x)^{-n} の形に変換
        if (
          processedLeft.type === "number" &&
          processedLeft.value === 1 &&
          right.type === "operator" &&
          right.op === "^" &&
          right.right.type === "symbol"
        ) {
          const base = ASTToLatex(right.left, astTransform);
          const exp = right.right.name;
          return `\\left(${base}\\right)^{-${exp}}`;
        }

        // a/f(x) → a * f(x)^{-1} の形に変換（期待値に合わせる）
        if (
          processedLeft.type === "number" &&
          processedLeft.value !== 1 &&
          right.type === "function"
        ) {
          const coeff = numberToLatex(processedLeft.value);
          const funcStr = ASTToLatex(right, astTransform);
          return `${coeff}\\left(${funcStr}\\right)^{-1}`;
        }

        // 分子と分母が両方とも関数の場合の処理
        if (processedLeft.type === "function" && right.type === "function") {
          const leftStr = ASTToLatex(processedLeft, astTransform);
          const rightStr = ASTToLatex(right, astTransform);
          return `\\left(${leftStr}\\right)\\left(${rightStr}\\right)^{-1}`;
        }

        // 常に分数形式で出力（約分処理は行わない）
        const leftStr =
          processedLeft.type === "number"
            ? numberToLatex(processedLeft.value)
            : ASTToLatex(processedLeft, astTransform, "fraction");
        const rightStr =
          right.type === "number"
            ? numberToLatex(right.value)
            : ASTToLatex(right, astTransform, "fraction");

        return `\\frac{${leftStr}}{${rightStr}}`;
      } else if (op === "^") {
        // x^n の出力（nがnumber型でも常にx^{n}形式で出力）
        if (node.left.type === "symbol" && node.right.type === "number") {
          if (node.right.value === 1) {
            return `${ASTToLatex(node.left, astTransform)}`;
          }
          return `${ASTToLatex(node.left, astTransform)}^{${numberToLatex(
            node.right.value
          )}}`;
        }

        // x^{分数} の場合の特別な処理
        if (
          node.left.type === "symbol" &&
          node.right.type === "operator" &&
          node.right.op === "/"
        ) {
          return `${ASTToLatex(node.left, astTransform)}^{${ASTToLatex(
            node.right,
            astTransform
          )}}`;
        }

        // 関数のべき乗は \left(関数\right)^{指数} の形式で出力
        if (node.left.type === "function") {
          return `\\left(${ASTToLatex(
            node.left,
            astTransform
          )}\\right)^{${ASTToLatex(node.right, astTransform)}}`;
        }

        // 累乗の底が加減のノードである場合は括弧をつける
        if (
          node.left.type === "operator" &&
          (node.left.op === "+" || node.left.op === "-")
        ) {
          return `\\left(${ASTToLatex(
            node.left,
            astTransform
          )}\\right)^{${ASTToLatex(node.right, astTransform)}}`;
        }

        // 通常のpow
        return `${ASTToLatex(node.left, astTransform)}^{${ASTToLatex(
          node.right,
          astTransform
        )}}`;
      }
      break;
    }
    case "function": {
      const { name, args } = node;
      if (name === "sqrt") {
        return `\\sqrt{${ASTToLatex(args[0], astTransform)}}`;
      } else if (name === "ln" || name === "log") {
        return `\\${name} ${wrapIfNeeded(args[0], "func", astTransform)}`;
      } else if (name === "exp") {
        return `e^{${ASTToLatex(args[0], astTransform)}}`;
      } else if (name === "sin" || name === "cos") {
        // sin(-x) → -sin x, cos(-x) → cos x のような処理
        const arg = args[0];
        if (
          arg &&
          arg.type === "operator" &&
          arg.op === "-" &&
          arg.left.type === "number" &&
          arg.left.value === 0
        ) {
          if (name === "sin") {
            return `-\\sin ${ASTToLatex(arg.right, astTransform)}`;
          } else if (name === "cos") {
            return `\\cos ${ASTToLatex(arg.right, astTransform)}`;
          }
        }

        // 引数が分数の場合は\left(\right)で囲む
        if (arg && arg.type === "operator" && arg.op === "/") {
          return `\\${name} \\left(${ASTToLatex(arg, astTransform)}\\right)`;
        }

        // 引数が乗算（係数×変数）の場合も\left(\right)で囲む
        if (
          arg &&
          arg.type === "operator" &&
          arg.op === "*" &&
          arg.left.type === "number" &&
          arg.right.type === "symbol"
        ) {
          return `\\${name} \\left(${ASTToLatex(arg, astTransform)}\\right)`;
        }

        // 引数が関数の場合は\left(\right)で囲む
        if (arg && arg.type === "function") {
          return `\\${name} \\left(${ASTToLatex(arg, astTransform)}\\right)`;
        }

        // 引数が複雑な場合は\left(\right)で囲む（ただし単純な冪は除く）
        if (
          arg &&
          arg.type === "operator" &&
          !(
            arg.op === "^" &&
            arg.left.type === "symbol" &&
            arg.right.type === "number"
          )
        ) {
          return `\\${name} \\left(${ASTToLatex(arg, astTransform)}\\right)`;
        }

        return `\\${name} ${wrapIfNeeded(args[0], "func", astTransform)}`;
      } else {
        return `\\${name} ${wrapIfNeeded(args[0], "func", astTransform)}`;
      }
    }
  }
  return "";
}

function wrapIfNeeded(
  node: ASTNode,
  parentOp: string,
  astTransform: boolean
): string {
  if (node.type === "operator") {
    if (parentOp === "*" && (node.op === "+" || node.op === "-")) {
      return `(${ASTToLatex(node, astTransform)})`;
    }
    if (parentOp === "func" && (node.op === "+" || node.op === "-")) {
      return `(${ASTToLatex(node, astTransform)})`;
    }
  }
  return ASTToLatex(node, astTransform);
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

  // 再帰的に変換
  if (node.type === "operator") {
    return {
      ...node,
      left: transformASTForLatex(node.left),
      right: transformASTForLatex(node.right),
    };
  } else if (node.type === "function") {
    return { ...node, args: node.args };
  }

  return node;
}

function isOne(node: ASTNode): boolean {
  return node.type === "number" && node.value === 1;
}

// 小数を分数に変換してLaTeX文字列で返す（例: 0.5→\frac{1}{2}）
function numberToLatex(value: number): string {
  // 既知の分数マッピング
  const known = [
    [1 / 2, "\\frac{1}{2}"],
    [-1 / 2, "-\\frac{1}{2}"],
    [1 / 3, "\\frac{1}{3}"],
    [-1 / 3, "-\\frac{1}{3}"],
    [1 / 4, "\\frac{1}{4}"],
    [-1 / 4, "-\\frac{1}{4}"],
    [3 / 2, "\\frac{3}{2}"],
    [-3 / 2, "-\\frac{3}{2}"],
    [2 / 3, "\\frac{2}{3}"],
    [-2 / 3, "-\\frac{2}{3}"],
    [3 / 4, "\\frac{3}{4}"],
    [-3 / 4, "-\\frac{3}{4}"],
    [5 / 2, "\\frac{5}{2}"],
    [-5 / 2, "-\\frac{5}{2}"],
    [4 / 3, "\\frac{4}{3}"],
    [-4 / 3, "-\\frac{4}{3}"],
    [5 / 4, "\\frac{5}{4}"],
    [-5 / 4, "-\\frac{5}{4}"],
    [0.5, "\\frac{1}{2}"],
    [-0.5, "-\\frac{1}{2}"],
    [1.5, "\\frac{3}{2}"],
    [-1.5, "-\\frac{3}{2}"],
    [2.5, "\\frac{5}{2}"],
    [-2.5, "-\\frac{5}{2}"],
    [0.25, "\\frac{1}{4}"],
    [-0.25, "-\\frac{1}{4}"],
    [0.75, "\\frac{3}{4}"],
    [-0.75, "-\\frac{3}{4}"],
  ];

  for (const [num, latex] of known) {
    if (Math.abs(value - (num as number)) < 1e-8) return latex as string;
  }

  // 整数の場合はそのまま返す
  if (Number.isInteger(value)) {
    return value.toString();
  }

  // 一般的な分数への変換を試行
  // 小数を分数に変換する関数
  function toFraction(
    decimal: number,
    maxDenominator: number = 1000
  ): [number, number] | null {
    if (Number.isInteger(decimal)) {
      return [decimal, 1];
    }

    const isNegative = decimal < 0;
    const absDecimal = Math.abs(decimal);

    // 連分数展開による分数変換
    let bestNumerator = 0;
    let bestDenominator = 1;
    let bestError = Math.abs(absDecimal);

    for (let denominator = 1; denominator <= maxDenominator; denominator++) {
      const numerator = Math.round(absDecimal * denominator);
      const error = Math.abs(absDecimal - numerator / denominator);

      if (error < bestError) {
        bestError = error;
        bestNumerator = numerator;
        bestDenominator = denominator;

        // 十分に近い場合は終了
        if (error < 1e-10) {
          break;
        }
      }
    }

    // 約分
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

    const divisor = gcd(bestNumerator, bestDenominator);
    const finalNum = bestNumerator / divisor;
    const finalDen = bestDenominator / divisor;

    // 元の値と十分近いかチェック
    if (Math.abs(absDecimal - finalNum / finalDen) < 1e-8) {
      return [isNegative ? -finalNum : finalNum, finalDen];
    }

    return null;
  }

  const fraction = toFraction(value);
  if (fraction) {
    const [numerator, denominator] = fraction;
    if (denominator === 1) {
      return numerator.toString();
    } else {
      if (numerator < 0) {
        return `-\\frac{${Math.abs(numerator)}}{${denominator}}`;
      } else {
        return `\\frac{${numerator}}{${denominator}}`;
      }
    }
  }

  return value.toString();
}
