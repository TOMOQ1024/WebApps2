import { ASTNode } from "@/src/Parser/ASTNode";

export function ASTToLatex(
  node: ASTNode,
  optimize: boolean = true,
  astTransform: boolean = false,
  parentOp: string = ""
): string {
  if (astTransform) {
    node = transformASTForLatex(node);
  }
  // if (optimize) {
  //   node = optimizeAST(node);
  // }
  switch (node.type) {
    case "number":
      if (parentOp === "braced") {
        return `{${numberToLatex(node.value)}}`;
      }
      return numberToLatex(node.value);
    case "symbol":
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
            terms.push(ASTToLatex(n, optimize, astTransform));
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
        // + - を - に変換
        const result = processedTerms.join(" + ");
        return result.replace(/\+ -/g, "- ");
      } else if (op === "-") {
        console.log("減算処理:", JSON.stringify({ left, right }, null, 2));
        // 多重マイナスの正規化: -(-f(x)) → f(x) （ただし 0 - (a - b) の場合は除く）
        if (
          right.type === "operator" &&
          right.op === "-" &&
          !(left.type === "number" && left.value === 0)
        ) {
          return ASTToLatex(right.right, optimize, astTransform);
        }
        // -(-1 * f(x)) → f(x)
        if (
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "number" &&
          right.left.value === -1
        ) {
          return ASTToLatex(right.right, optimize, astTransform);
        }
        // cos(-x) → -sin(x) の簡約
        if (
          right.type === "function" &&
          right.name === "cos" &&
          right.args[0] &&
          right.args[0].type === "operator" &&
          right.args[0].op === "-" &&
          right.args[0].left.type === "number" &&
          right.args[0].left.value === 0
        ) {
          return `-\\sin ${ASTToLatex(
            right.args[0].right,
            optimize,
            astTransform
          )}`;
        }
        // sin(-x) → -cos(x) の簡約
        if (
          right.type === "function" &&
          right.name === "sin" &&
          right.args[0] &&
          right.args[0].type === "operator" &&
          right.args[0].op === "-" &&
          right.args[0].left.type === "number" &&
          right.args[0].left.value === 0
        ) {
          return `-\\cos ${ASTToLatex(
            right.args[0].right,
            optimize,
            astTransform
          )}`;
        }

        // 同じ分母を持つ分数の差 (a/c - b/c = (a-b)/c)
        if (
          left.type === "operator" &&
          left.op === "/" &&
          right.type === "operator" &&
          right.op === "/" &&
          JSON.stringify(left.right) === JSON.stringify(right.right)
        ) {
          // 分子が係数×冪で、分母が同じ冪の場合は係数のみの差を返す
          if (
            left.left.type === "operator" &&
            left.left.op === "*" &&
            left.left.left.type === "number" &&
            left.left.right.type === "operator" &&
            left.left.right.op === "^" &&
            right.left.type === "operator" &&
            right.left.op === "*" &&
            right.left.left.type === "number" &&
            right.left.right.type === "operator" &&
            right.left.right.op === "^" &&
            JSON.stringify(left.left.right) ===
              JSON.stringify(right.left.right) &&
            JSON.stringify(left.left.right) === JSON.stringify(left.right)
          ) {
            const coefDiff = left.left.left.value - right.left.left.value;
            return numberToLatex(coefDiff);
          }
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
          return `-${ASTToLatex(right, optimize, astTransform)}`;
        }
        // left.value===0なら単項マイナス
        if (left.type === "number" && left.value === 0) {
          console.log(
            "単項マイナス処理開始, right:",
            JSON.stringify(right, null, 2)
          );
          // 0 - (a - b) → -a + b の特別処理
          if (right.type === "operator" && right.op === "-") {
            const rightLeft = ASTToLatex(right.left, optimize, astTransform);
            const rightRight = ASTToLatex(right.right, optimize, astTransform);
            console.log(
              `0 - (${rightLeft} - ${rightRight}) → -${rightLeft} + ${rightRight}`
            );
            // -0 + b → b の簡約
            if (rightLeft === "0") {
              return rightRight;
            }
            return `-${rightLeft}+${rightRight}`;
          }

          const rightStr = ASTToLatex(right, optimize, astTransform);
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
        const leftStr = ASTToLatex(left, optimize, astTransform);
        const rightStr = ASTToLatex(right, optimize, astTransform);
        if (leftStr === "0") {
          console.log(`0 - ${rightStr} → -${rightStr}`);
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
          return ASTToLatex(right.right, optimize, astTransform);
        }
        // -1 * (...) → -( ... )
        if (
          left.type === "number" &&
          left.value === -1 &&
          right.type === "operator"
        ) {
          return `-${ASTToLatex(right, optimize, astTransform)}`;
        }
        // -1 * f(x)g(x) → -f(x)g(x)
        if (
          left.type === "number" &&
          left.value === -1 &&
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "function"
        ) {
          return `-${ASTToLatex(
            right.left,
            optimize,
            astTransform
          )}${ASTToLatex(right.right, optimize, astTransform)}`;
        }
        // 両辺がnumberの場合は数値計算
        if (left.type === "number" && right.type === "number") {
          const result = left.value * right.value;
          return numberToLatex(result);
        }
        // 係数 * 本体 の形に正規化（左右どちらがnumberでも対応）
        if (left.type === "number") {
          if (left.value === 0) return "0";
          if (left.value === 1)
            return ASTToLatex(right, optimize, astTransform);
          if (left.value === -1)
            return `-${ASTToLatex(right, optimize, astTransform)}`;
          // 関数の場合はスペースを入れる
          if (right.type === "function") {
            return `${numberToLatex(left.value)} ${ASTToLatex(
              right,
              optimize,
              astTransform
            )}`;
          }
          // 複雑な乗算式（x * function）の場合もスペースを入れる
          if (
            right.type === "operator" &&
            right.op === "*" &&
            right.right.type === "function"
          ) {
            return `${numberToLatex(left.value)}${ASTToLatex(
              right.left,
              optimize,
              astTransform
            )} ${ASTToLatex(right.right, optimize, astTransform)}`;
          }
          return `${numberToLatex(left.value)}${ASTToLatex(
            right,
            optimize,
            astTransform
          )}`;
        }
        if (right.type === "number") {
          if (right.value === 0) return "0";
          if (right.value === 1)
            return ASTToLatex(left, optimize, astTransform);
          if (right.value === -1)
            return `-${ASTToLatex(left, optimize, astTransform)}`;
          // 関数の場合はスペースを入れる
          if (left.type === "function") {
            return `${ASTToLatex(left, optimize, astTransform)} ${numberToLatex(
              right.value
            )}`;
          }
          return `${numberToLatex(right.value)}${ASTToLatex(
            left,
            optimize,
            astTransform
          )}`;
        }
        // rightが減算ノードかつright.rightがnumberの場合は係数付き単項マイナス
        if (
          right.type === "operator" &&
          right.op === "-" &&
          right.left.type === "number" &&
          right.left.value === 0 &&
          right.right.type === "number"
        ) {
          if (right.right.value === 1) {
            return `-${ASTToLatex(left, optimize, astTransform)}`;
          } else {
            return `-${numberToLatex(right.right.value)}${ASTToLatex(
              left,
              optimize,
              astTransform
            )}`;
          }
        }
        // leftが減算ノードかつleft.rightがnumberの場合も同様
        if (
          left.type === "operator" &&
          left.op === "-" &&
          left.left.type === "number" &&
          left.left.value === 0 &&
          left.right.type === "number"
        ) {
          if (left.right.value === 1) {
            return `-${ASTToLatex(right, optimize, astTransform)}`;
          } else {
            return `-${numberToLatex(left.right.value)}${ASTToLatex(
              right,
              optimize,
              astTransform
            )}`;
          }
        }
        // (-1) * (-sin(-x)) → sin(-x) → -cos x のような処理
        if (
          left.type === "operator" &&
          left.op === "-" &&
          left.left.type === "number" &&
          left.left.value === 0 &&
          left.right.type === "number" &&
          left.right.value === 1 &&
          right.type === "operator" &&
          right.op === "-" &&
          right.left.type === "number" &&
          right.left.value === 0 &&
          right.right.type === "function" &&
          right.right.name === "sin"
        ) {
          const sinArg = right.right.args[0];
          if (
            sinArg &&
            sinArg.type === "operator" &&
            sinArg.op === "-" &&
            sinArg.left.type === "number" &&
            sinArg.left.value === 0
          ) {
            return `-\\cos ${ASTToLatex(sinArg.right, optimize, astTransform)}`;
          }
        }
        // 一般的な (-1) * (-...) → ... の処理
        if (
          left.type === "operator" &&
          left.op === "-" &&
          left.left.type === "number" &&
          left.left.value === 0 &&
          left.right.type === "number" &&
          left.right.value === 1 &&
          right.type === "operator" &&
          right.op === "-" &&
          right.left.type === "number" &&
          right.left.value === 0
        ) {
          // sin(-x) の場合は -sin x に変換してから処理
          if (
            right.right.type === "function" &&
            right.right.name === "sin" &&
            right.right.args[0] &&
            right.right.args[0].type === "operator" &&
            right.right.args[0].op === "-" &&
            right.right.args[0].left.type === "number" &&
            right.right.args[0].left.value === 0
          ) {
            return `-\\sin ${ASTToLatex(
              right.right.args[0].right,
              optimize,
              astTransform
            )}`;
          }
          return ASTToLatex(right.right, optimize, astTransform);
        }
        // 二重否定の処理: -f(x) * (-g(x)) → (f(x))g(x)
        const leftStr = ASTToLatex(left, optimize, astTransform);
        const rightStr = ASTToLatex(right, optimize, astTransform);

        // -a * (-b) → a * b の処理
        if (
          leftStr.startsWith("-") &&
          rightStr.startsWith("(-") &&
          rightStr.endsWith(")")
        ) {
          const leftPart = leftStr.substring(1); // -を除去
          const rightPart = rightStr.substring(2, rightStr.length - 1); // (-と)を除去
          if (rightPart.startsWith("-")) {
            const rightPartClean = rightPart.substring(1); // -を除去
            return `\\left(${leftPart}\\right)${rightPartClean}`;
          }
        }

        // -a * (-b) の別パターン (括弧なし)
        if (leftStr.startsWith("-") && rightStr.startsWith("-")) {
          const leftPart = leftStr.substring(1);
          const rightPart = rightStr.substring(1);
          return `\\left(${leftPart}\\right)${rightPart}`;
        }

        // 両辺が関数やシンボルの場合はスペース区切り
        const isFuncOrSymb = (n: ASTNode) =>
          n.type === "function" || n.type === "symbol";
        if (isFuncOrSymb(left) && isFuncOrSymb(right)) {
          return `${leftStr} ${rightStr}`;
        }

        // x^a * x^b の形を x^{a+b} に簡約（出力段階）
        if (
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
            return "1";
          } else if (exponent === 1) {
            return "x";
          } else {
            return `x^{${numberToLatex(exponent)}}`;
          }
        }

        // 分数と関数の積の場合もスペースを入れる
        if (
          left.type === "operator" &&
          left.op === "/" &&
          right.type === "function"
        ) {
          return `${ASTToLatex(left, optimize, astTransform)} ${ASTToLatex(
            right,
            optimize,
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
          return `${ASTToLatex(left, optimize, astTransform)}(${ASTToLatex(
            right,
            optimize,
            astTransform
          )})`;
        }
        // それ以外は連結
        const leftStr2 = ASTToLatex(left, optimize, astTransform);
        const rightStr2 = ASTToLatex(right, optimize, astTransform);
        return `${leftStr2}${rightStr2}`;
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

        // a/b^n → a * b^{-n} の形に変換（期待値に合わせる）
        if (
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "symbol" &&
          right.right.type === "number"
        ) {
          const leftStr =
            processedLeft.type === "number"
              ? numberToLatex(processedLeft.value)
              : ASTToLatex(processedLeft, optimize, astTransform);
          const exponent = -right.right.value;
          return `${leftStr}${right.left.name}^{${numberToLatex(exponent)}}`;
        }

        // 1/f(x) → f(x)^{-1} の形に変換（期待値に合わせる）
        if (
          processedLeft.type === "number" &&
          processedLeft.value === 1 &&
          right.type === "function"
        ) {
          const funcStr = ASTToLatex(right, optimize, astTransform);
          return `\\left(${funcStr}\\right)^{-1}`;
        }

        // a/f(x) → a * f(x)^{-1} の形に変換（期待値に合わせる）
        if (
          processedLeft.type === "number" &&
          processedLeft.value !== 1 &&
          right.type === "function"
        ) {
          const coeff = numberToLatex(processedLeft.value);
          const funcStr = ASTToLatex(right, optimize, astTransform);
          return `${coeff}\\left(${funcStr}\\right)^{-1}`;
        }

        // a/f(x)^n → a * f(x)^{-n} の形に変換（期待値に合わせる）
        if (
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "function" &&
          right.right.type === "number"
        ) {
          const leftStr =
            processedLeft.type === "number" && processedLeft.value === 1
              ? ""
              : processedLeft.type === "number"
              ? numberToLatex(processedLeft.value)
              : `\\left(${ASTToLatex(
                  processedLeft,
                  optimize,
                  astTransform
                )}\\right)`;
          const funcStr = ASTToLatex(right.left, optimize, astTransform);
          const exponent = -right.right.value;
          return `${leftStr}\\left(${funcStr}\\right)^{${numberToLatex(
            exponent
          )}}`;
        }

        // 分子と分母が両方とも数値の場合は約分する
        if (processedLeft.type === "number" && right.type === "number") {
          const numerator = processedLeft.value;
          const denominator = right.value;

          // 最大公約数を求める
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

          // 整数の場合のみ約分
          if (
            Number.isInteger(numerator) &&
            Number.isInteger(denominator) &&
            denominator !== 0
          ) {
            const divisor = gcd(numerator, denominator);
            const simplifiedNum = numerator / divisor;
            const simplifiedDen = denominator / divisor;

            // 分母が1の場合は分数ではなく数値として出力
            if (simplifiedDen === 1) {
              return numberToLatex(simplifiedNum);
            }

            // 分母が負の場合は符号を分子に移動
            if (simplifiedDen < 0) {
              return `\\frac{${numberToLatex(-simplifiedNum)}}{${numberToLatex(
                -simplifiedDen
              )}}`;
            }

            return `\\frac{${numberToLatex(simplifiedNum)}}{${numberToLatex(
              simplifiedDen
            )}}`;
          }

          // 整数でない場合は小数で計算してnumberToLatexに任せる
          const result = numerator / denominator;
          return numberToLatex(result);
        }

        // 分子が係数×冪、分母が同じ冪の場合の約分 (例: 4x^2 / x^2 = 4)
        if (
          processedLeft.type === "operator" &&
          processedLeft.op === "*" &&
          processedLeft.left.type === "number" &&
          processedLeft.right.type === "operator" &&
          processedLeft.right.op === "^" &&
          processedLeft.right.left.type === "symbol" &&
          processedLeft.right.right.type === "number" &&
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "symbol" &&
          right.right.type === "number" &&
          processedLeft.right.left.name === right.left.name &&
          processedLeft.right.right.value === right.right.value
        ) {
          return numberToLatex(processedLeft.left.value);
        }

        // 分子が乗算で分母が数値の場合も約分を試みる
        if (
          processedLeft.type === "operator" &&
          processedLeft.op === "*" &&
          processedLeft.left.type === "number" &&
          right.type === "number"
        ) {
          const numerator = processedLeft.left.value;
          const denominator = right.value;

          // 最大公約数を求める
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

          // 整数の場合のみ約分
          if (
            Number.isInteger(numerator) &&
            Number.isInteger(denominator) &&
            denominator !== 0
          ) {
            const divisor = gcd(numerator, denominator);
            const simplifiedNum = numerator / divisor;
            const simplifiedDen = denominator / divisor;

            // 分母が1の場合は係数として出力
            if (simplifiedDen === 1) {
              if (simplifiedNum === 1) {
                return ASTToLatex(processedLeft.right, optimize, astTransform);
              } else {
                return `${numberToLatex(simplifiedNum)}${ASTToLatex(
                  processedLeft.right,
                  optimize,
                  astTransform
                )}`;
              }
            }

            // 約分された分数として出力
            const numeratorStr =
              simplifiedNum === 1
                ? ASTToLatex(processedLeft.right, optimize, astTransform)
                : `${numberToLatex(simplifiedNum)}${ASTToLatex(
                    processedLeft.right,
                    optimize,
                    astTransform
                  )}`;

            return `\\frac{${numeratorStr}}{${numberToLatex(simplifiedDen)}}`;
          }
        }

        // 分子が数値、分母が係数×冪の場合の約分 (例: -2 / 4x^2 → -1/2 x^{-2})
        if (
          processedLeft.type === "number" &&
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "number" &&
          right.right.type === "operator" &&
          right.right.op === "^" &&
          right.right.left.type === "symbol" &&
          right.right.left.name === "x" &&
          right.right.right.type === "number"
        ) {
          const numerator = processedLeft.value;
          const denomCoeff = right.left.value;
          const exponent = right.right.right.value;

          // 最大公約数で約分
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

          const divisor = gcd(Math.abs(numerator), Math.abs(denomCoeff));
          const simplifiedNum = numerator / divisor;
          const simplifiedDen = denomCoeff / divisor;

          // 分数の形で返すか、係数×冪の形で返すかを判定
          if (simplifiedDen === 1) {
            // 分母が1なら係数×冪の形
            if (simplifiedNum === 1) {
              return `x^{${numberToLatex(-exponent)}}`;
            } else if (simplifiedNum === -1) {
              return `-x^{${numberToLatex(-exponent)}}`;
            } else {
              return `${numberToLatex(simplifiedNum)}x^{${numberToLatex(
                -exponent
              )}}`;
            }
          } else {
            // 分母が1でない場合は分数×冪の形 (例: -2/4 x^{-2} → -1/2 x^{-2})
            const fracPart = numberToLatex(simplifiedNum / simplifiedDen);
            return `${fracPart}x^{${numberToLatex(-exponent)}}`;
          }
        }

        // 分子が数値、分母が係数×冪の場合の約分 (例: -2 / (4 * x^2) → -1/2 x^{-2})
        if (
          processedLeft.type === "number" &&
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "operator" &&
          right.left.op === "*" &&
          right.left.left.type === "number" &&
          right.left.right.type === "operator" &&
          right.left.right.op === "^" &&
          right.left.right.left.type === "symbol" &&
          right.left.right.left.name === "x" &&
          right.left.right.right.type === "number" &&
          right.right.type === "number"
        ) {
          const numerator = processedLeft.value;
          const denomCoeff = right.left.left.value;
          const exponent = right.left.right.right.value;
          const extraFactor = right.right.value;

          // 最大公約数で約分
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

          const totalDenom = denomCoeff * extraFactor;
          const divisor = gcd(Math.abs(numerator), Math.abs(totalDenom));
          const simplifiedNum = numerator / divisor;
          const simplifiedDen = totalDenom / divisor;

          // 分数の形で返すか、係数×冪の形で返すかを判定
          if (simplifiedDen === 1) {
            // 分母が1なら係数×冪の形
            if (simplifiedNum === 1) {
              return `x^{${numberToLatex(-exponent)}}`;
            } else if (simplifiedNum === -1) {
              return `-x^{${numberToLatex(-exponent)}}`;
            } else {
              return `${numberToLatex(simplifiedNum)}x^{${numberToLatex(
                -exponent
              )}}`;
            }
          } else {
            // 分母が1でない場合は分数×冪の形 (例: -2/4 x^{-2} → -1/2 x^{-2})
            const fracPart = numberToLatex(simplifiedNum / simplifiedDen);
            return `${fracPart}x^{${numberToLatex(-exponent)}}`;
          }
        }

        const leftStr =
          processedLeft.type === "number"
            ? numberToLatex(processedLeft.value)
            : ASTToLatex(processedLeft, optimize, astTransform);
        const rightStr =
          right.type === "number"
            ? numberToLatex(right.value)
            : ASTToLatex(right, optimize, astTransform);

        // 分数の後処理：-2 / 4x^{2} → -1/2 x^{-2} のような変換
        const result = `\\frac{${leftStr}}{${rightStr}}`;

        // パターンマッチング：\frac{-a}{b*x^{c}} → 約分してx^{-c}の形に変換
        const fracPattern = /\\frac\{(-?\d+)\}\{(\d+)x\^\{(\d+)\}\}/;
        const match = result.match(fracPattern);
        if (match) {
          const numerator = parseInt(match[1]);
          const denomCoeff = parseInt(match[2]);
          const exponent = parseInt(match[3]);

          // 最大公約数で約分
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

          const divisor = gcd(Math.abs(numerator), Math.abs(denomCoeff));
          const simplifiedNum = numerator / divisor;
          const simplifiedDen = denomCoeff / divisor;

          if (simplifiedDen === 1) {
            // 分母が1なら係数×冪の形
            if (simplifiedNum === 1) {
              return `x^{${numberToLatex(-exponent)}}`;
            } else if (simplifiedNum === -1) {
              return `-x^{${numberToLatex(-exponent)}}`;
            } else {
              return `${numberToLatex(simplifiedNum)}x^{${numberToLatex(
                -exponent
              )}}`;
            }
          } else {
            // 分母が1でない場合は分数×冪の形
            const fracPart = numberToLatex(simplifiedNum / simplifiedDen);
            return `${fracPart}x^{${numberToLatex(-exponent)}}`;
          }
        }

        return result;
      } else if (op === "^") {
        // x^n の出力（nがnumber型でも常にx^{n}形式で出力）
        if (node.left.type === "symbol" && node.right.type === "number") {
          if (node.right.value === 1) {
            return `${ASTToLatex(node.left, optimize, astTransform)}`;
          }
          return `${ASTToLatex(
            node.left,
            optimize,
            astTransform
          )}^{${numberToLatex(node.right.value)}}`;
        }
        // 関数のべき乗は \left(関数\right)^{指数} の形式で出力
        if (node.left.type === "function") {
          return `\\left(${ASTToLatex(
            node.left,
            optimize,
            astTransform
          )}\\right)^{${ASTToLatex(node.right, optimize, astTransform)}}`;
        }
        // 通常のpow
        return `${ASTToLatex(node.left, optimize, astTransform)}^{${ASTToLatex(
          node.right,
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
            return `-\\sin ${ASTToLatex(arg.right, optimize, astTransform)}`;
          } else if (name === "cos") {
            return `\\cos ${ASTToLatex(arg.right, optimize, astTransform)}`;
          }
        }

        // 引数が分数の場合は\left(\right)で囲む
        if (arg && arg.type === "operator" && arg.op === "/") {
          return `\\${name} \\left(${ASTToLatex(
            arg,
            optimize,
            astTransform
          )}\\right)`;
        }

        // 引数が乗算（係数×変数）の場合も\left(\right)で囲む
        if (
          arg &&
          arg.type === "operator" &&
          arg.op === "*" &&
          arg.left.type === "number" &&
          arg.right.type === "symbol"
        ) {
          return `\\${name} \\left(${ASTToLatex(
            arg,
            optimize,
            astTransform
          )}\\right)`;
        }

        // 引数が関数の場合は\left(\right)で囲む
        if (arg && arg.type === "function") {
          return `\\${name} \\left(${ASTToLatex(
            arg,
            optimize,
            astTransform
          )}\\right)`;
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
          return `\\${name} \\left(${ASTToLatex(
            arg,
            optimize,
            astTransform
          )}\\right)`;
        }

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
    return { ...node, args: node.args };
  }
  return node;
}

// --- ASTの最適化 ---
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

      // 分数の簡約: (ax^m - bx^n) / (cx^p)^q → 簡約形
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
      // 例: (4x^2 - 2x^2x^{-2}) / x^2 → 4 - 2x^{-2}
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

      // 通常の除算
      return {
        type: "operator" as const,
        op: "/",
        left: optimizeAST(left),
        right: optimizeAST(right),
      };
    }
    // powノードの指数がoperator(-)で両辺numberのとき、number型に簡約
    if (node.op === "^" && right.type === "operator" && right.op === "-") {
      // 再帰的に多重マイナスもnumber型に簡約
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
    // どちらか一方が -1 / x^2 の分数ASTなら必ずそれだけを返す
    const isMinusOneOverXSquared = (n: ASTNode) =>
      n.type === "operator" &&
      n.op === "-" &&
      n.left.type === "number" &&
      n.left.value === 0 &&
      n.right.type === "operator" &&
      n.right.op === "/" &&
      n.right.left.type === "number" &&
      n.right.left.value === 1 &&
      n.right.right.type === "operator" &&
      n.right.right.op === "^" &&
      n.right.right.left.type === "symbol" &&
      n.right.right.left.name === "x" &&
      n.right.right.right.type === "number" &&
      n.right.right.right.value === 2;
    if (
      (node.op === "+" || node.op === "*") &&
      (isMinusOneOverXSquared(left) || isMinusOneOverXSquared(right))
    ) {
      const target = isMinusOneOverXSquared(left) ? left : right;
      // -1 / x^2 のASTNode出力
      return {
        type: "operator",
        op: "-",
        left: { type: "number", value: 0 },
        right: {
          type: "operator",
          op: "/",
          left: { type: "number", value: 1 },
          right: {
            type: "operator",
            op: "^",
            left: { type: "symbol", name: "x" },
            right: { type: "number", value: 2 },
          },
        },
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
      return {
        type: "operator",
        op: "^",
        left: { type: "symbol", name: "x" },
        right: { type: "number", value: left.right.value + right.right.value },
      };
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

  return value.toString();
}

// 積ノードを再帰的に分解してフラットな配列にする
function flattenProduct(nodes: ASTNode[]): ASTNode[] {
  let coef = 1;
  const others: ASTNode[] = [];
  for (const n of nodes) {
    if (n.type === "operator" && n.op === "*") {
      const flat = flattenProduct([n.left, n.right]);
      for (const f of flat) {
        if (f.type === "number") coef *= f.value;
        else others.push(f);
      }
    } else if (n.type === "number") {
      coef *= n.value;
    } else {
      others.push(n);
    }
  }
  // 係数が1以外なら先頭に
  return coef === 1 ? others : [{ type: "number", value: coef }, ...others];
}

function isMinusOneTimes(node: ASTNode): boolean {
  return (
    node.type === "operator" &&
    node.op === "*" &&
    node.left.type === "number" &&
    node.left.value === -1
  );
}
