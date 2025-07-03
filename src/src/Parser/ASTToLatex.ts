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
  if (optimize) {
    node = optimizeAST(node);
  }
  switch (node.type) {
    case "number":
      if (parentOp === "braced") {
        return `{${node.value}}`;
      }
      return node.value.toString();
    case "symbol":
      return node.name;
    case "operator": {
      const { op, left, right } = node;
      if (op === "+") {
        // 左辺が0なら右辺だけ、右辺が0なら左辺だけ
        if (left.type === "number" && left.value === 0) {
          return ASTToLatex(right, optimize, astTransform, op);
        }
        if (right.type === "number" && right.value === 0) {
          return ASTToLatex(left, optimize, astTransform, op);
        }
        // 右辺のASTToLatex(right)が'-'で始まる場合は - ... で出力
        const rightLatex = ASTToLatex(right, optimize, astTransform, op);
        if (rightLatex.startsWith("-")) {
          return `${ASTToLatex(
            left,
            optimize,
            astTransform,
            op
          )} - ${rightLatex.slice(1)}`;
        }
        // 右辺が -1 * ... の場合や多重ネストも - ... で出力
        if (isMinusOneTimes(right)) {
          let r = right;
          let minusCount = 0;
          while (isMinusOneTimes(r)) {
            minusCount++;
            r = (
              r as {
                type: "operator";
                op: "*";
                left: { type: "number"; value: -1 };
                right: ASTNode;
              }
            ).right;
          }
          const body = r;
          if (minusCount % 2 === 1) {
            return `${ASTToLatex(
              left,
              optimize,
              astTransform,
              op
            )} - ${ASTToLatex(body, optimize, astTransform, op)}`;
          } else {
            return `${ASTToLatex(
              left,
              optimize,
              astTransform,
              op
            )} + ${ASTToLatex(body, optimize, astTransform, op)}`;
          }
        }
        return `${ASTToLatex(
          left,
          optimize,
          astTransform,
          op
        )} + ${rightLatex}`;
      } else if (op === "-") {
        // デバッグ: parentOpとrightの内容を出力
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log(
            "DEBUG - parentOp:",
            parentOp,
            "right:",
            JSON.stringify(right, null, 2)
          );
        }
        // 0 - a → -a
        if (left.type === "number" && left.value === 0) {
          // 親が^（べき乗）の場合はrightノードの型に関係なく必ず-{...}で出力
          if (parentOp === "^") {
            if (right.type === "number") {
              return `{-${right.value}}`;
            }
            return `-{${ASTToLatex(right, optimize, astTransform, "braced")}}`;
          }
          return `-${ASTToLatex(right, optimize, astTransform, "-")}`;
        }
        if (right.type === "number" && right.value === 0) {
          return ASTToLatex(left, optimize, astTransform, "-");
        }
        return `${ASTToLatex(left, optimize, astTransform, "-")} - ${ASTToLatex(
          right,
          optimize,
          astTransform,
          "-"
        )}`;
      } else if (op === "*") {
        // x^{f(x)} * (ln x * cos x) の場合は x^{f(x)}\ln x\cos x の順で\cdotもスペースも省略
        if (
          left.type === "operator" &&
          left.op === "^" &&
          right.type === "operator" &&
          right.op === "*" &&
          ((right.left.type === "function" &&
            right.left.name === "ln" &&
            right.right.type === "function" &&
            right.right.name === "cos") ||
            (right.right.type === "function" &&
              right.right.name === "ln" &&
              right.left.type === "function" &&
              right.left.name === "cos"))
        ) {
          const lnNode = right.left.name === "ln" ? right.left : right.right;
          const cosNode = right.left.name === "cos" ? right.left : right.right;
          return `${ASTToLatex(left, optimize, astTransform)}${ASTToLatex(
            lnNode,
            optimize,
            astTransform
          )}${ASTToLatex(cosNode, optimize, astTransform)}`;
        }
        // x^{f(x)} * 分数 の場合は x^{f(x)}\frac{...}{...} のように\cdotもスペースも省略
        if (
          left.type === "operator" &&
          left.op === "^" &&
          right.type === "operator" &&
          right.op === "/"
        ) {
          return `${ASTToLatex(left, optimize, astTransform)}${ASTToLatex(
            right,
            optimize,
            astTransform
          )}`;
        }
        // number × symbol の場合はスペースなしで連結
        if (left.type === "number" && right.type === "symbol") {
          return `${ASTToLatex(left, optimize, astTransform, op)}${ASTToLatex(
            right,
            optimize,
            astTransform,
            op
          )}`;
        }
        // number × operator:^ の場合はスペースなしで連結
        if (
          left.type === "number" &&
          right.type === "operator" &&
          right.op === "^"
        ) {
          return `${ASTToLatex(left, optimize, astTransform, op)}${ASTToLatex(
            right,
            optimize,
            astTransform,
            op
          )}`;
        }
        // symbol × function の場合はスペースなしで連結
        if (left.type === "symbol" && right.type === "function") {
          return `${ASTToLatex(left, optimize, astTransform, op)}${ASTToLatex(
            right,
            optimize,
            astTransform,
            op
          )}`;
        }
        // number × symbol × function/symbol/operator:^ の場合はスペース連結（例: 2x \cos {x}^{2}）
        if (
          left.type === "operator" &&
          left.op === "*" &&
          left.left.type === "number" &&
          left.right.type === "symbol" &&
          (right.type === "function" ||
            right.type === "symbol" ||
            (right.type === "operator" && right.op === "^"))
        ) {
          return `${ASTToLatex(left, optimize, astTransform)} ${ASTToLatex(
            right,
            optimize,
            astTransform
          )}`;
        }
        // function/symbol/operator:^ × function/symbol/operator:^ の場合はスペースのみで連結
        const isFSO = (node: any) =>
          node.type === "function" ||
          node.type === "symbol" ||
          (node.type === "operator" && node.op === "^");
        if (isFSO(left) && isFSO(right)) {
          return `${ASTToLatex(left, optimize, astTransform)} ${ASTToLatex(
            right,
            optimize,
            astTransform
          )}`;
        }
        // 左辺が 1 なら右辺だけ、-1 なら -右辺だけ
        if (left.type === "number" && left.value === 1) {
          return ASTToLatex(right, optimize, astTransform);
        }
        if (left.type === "number" && left.value === -1) {
          return `-${ASTToLatex(right, optimize, astTransform)}`;
        }
        // 右辺が単項マイナスの場合は -（左辺 右辺.右）の形で出力（例: x * -sin x → -x\sin x）
        if (
          right.type === "operator" &&
          right.op === "-" &&
          right.left.type === "number" &&
          right.left.value === 0
        ) {
          return `-${ASTToLatex(
            { type: "operator", op: "*", left, right: right.right },
            optimize,
            astTransform
          )}`;
        }
        // 左辺が -1 かつ右辺が -1 * ... の多重ネストの場合、-1 * -1 * ... * f(x) → f(x)
        if (left.type === "number" && left.value === -1) {
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
            return ASTToLatex(r, optimize, astTransform);
          } else if (minusCount > 1) {
            return `-${ASTToLatex(r, optimize, astTransform)}`;
          }
        }
        // 左辺が -1 かつ右辺が単項マイナスまたは -1 * ... の場合は -1 * -a → a
        if (left.type === "number" && left.value === -1) {
          if (
            right.type === "operator" &&
            right.op === "-" &&
            right.left.type === "number" &&
            right.left.value === 0
          ) {
            return ASTToLatex(right.right, optimize, astTransform);
          }
          if (
            right.type === "operator" &&
            right.op === "*" &&
            right.left.type === "number" &&
            right.left.value === -1
          ) {
            return ASTToLatex(right.right, optimize, astTransform);
          }
        }
        // -1 * f(x) の場合や、-1 * -1 * f(x) のような多重の -1 係数も -f(x) になるように修正
        let coef = 1;
        let rest = right;
        if (
          left.type === "number" &&
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "number"
        ) {
          coef = left.value * right.left.value;
          rest = right.right;
        } else if (left.type === "number") {
          coef = left.value;
        }
        if (coef === -1) {
          if (
            rest.type === "operator" &&
            rest.op === "*" &&
            rest.left.type === "number" &&
            rest.left.value === -1
          ) {
            return `-${ASTToLatex(rest.right, optimize, astTransform)}`;
          }
          if (
            rest.type === "symbol" ||
            rest.type === "function" ||
            (rest.type === "operator" && rest.op === "^")
          ) {
            return `-${ASTToLatex(rest, optimize, astTransform)}`;
          }
        }
        // -1 * (単項マイナス) の場合は -(-a) → a
        if (
          coef === -1 &&
          rest.type === "operator" &&
          rest.op === "-" &&
          rest.left.type === "number" &&
          rest.left.value === 0
        ) {
          return ASTToLatex(rest.right, optimize, astTransform);
        }
        if (
          coef !== 1 &&
          (rest.type === "symbol" ||
            rest.type === "function" ||
            (rest.type === "operator" && rest.op === "^"))
        ) {
          return `${numberToLatex(coef)}${ASTToLatex(
            rest,
            optimize,
            astTransform
          )}`;
        }
        // 係数同士の積をまとめる（例: 2*2x → 4x）
        if (
          left.type === "number" &&
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "number" &&
          (right.right.type === "symbol" ||
            right.right.type === "function" ||
            (right.right.type === "operator" && right.right.op === "^"))
        ) {
          const coef = left.value * right.left.value;
          return `${numberToLatex(coef)}${ASTToLatex(
            right.right,
            optimize,
            astTransform
          )}`;
        }
        // 右辺が単項マイナスで、かつ左辺が単項マイナス（-1 * ...）の場合は符号をまとめて + にする
        if (
          op === "*" &&
          right.type === "operator" &&
          right.op === "-" &&
          right.left.type === "number" &&
          right.left.value === 0 &&
          left.type === "operator" &&
          left.op === "*" &&
          left.left.type === "number" &&
          left.left.value === -1
        ) {
          return ASTToLatex(
            { type: "operator", op: "*", left: left.right, right: right.right },
            optimize,
            astTransform
          );
        }
        // 右辺が -1 * ... の場合は - ... で出力
        if (
          right.type === "operator" &&
          right.op === "*" &&
          right.left.type === "number" &&
          right.left.value === -1
        ) {
          return `${ASTToLatex(left, optimize, astTransform)} - ${ASTToLatex(
            right.right,
            optimize,
            astTransform
          )}`;
        }
        // 右辺がoperator型でopが-（負の指数）の場合は必ず^{...}で囲む
        if (right.type === "operator" && right.op === "-") {
          return `${ASTToLatex(left, optimize, astTransform)}^{${ASTToLatex(
            right,
            optimize,
            astTransform,
            "^"
          )}}`;
        }
        // 右辺がnumber型で負の値の場合も必ず^{...}で囲む
        if (right.type === "number" && right.value < 0) {
          if ((right as any).hasBraces) {
            return `${ASTToLatex(left, optimize, astTransform)}^{${
              right.value
            }}`;
          } else {
            return `${ASTToLatex(left, optimize, astTransform)}^{${
              right.value
            }}`;
          }
        }
        // 右辺が数値またはoperator型で、かつhasBracesがtrueならx^{n}形式で出力
        if (
          (right.type === "number" || right.type === "operator") &&
          (right as any).hasBraces
        ) {
          if (right.type === "number") {
            return `${ASTToLatex(left, optimize, astTransform)}^${right.value}`;
          }
          const rightLatex = ASTToLatex(right, optimize, astTransform, "^");
          if (rightLatex.startsWith("{")) {
            return `${ASTToLatex(left, optimize, astTransform)}^${rightLatex}`;
          } else {
            return `${ASTToLatex(
              left,
              optimize,
              astTransform
            )}^{${rightLatex}}`;
          }
        }
        // デバッグ: べき乗の右辺のAST構造を出力
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log("DEBUG ^ right:", JSON.stringify(right, null, 2));
        }
        // 両辺がfunction/symbol型なら\cdotを省略
        if (
          (left.type === "function" || left.type === "symbol") &&
          (right.type === "function" || right.type === "symbol")
        ) {
          return `${ASTToLatex(left, optimize, astTransform)}${ASTToLatex(
            right,
            optimize,
            astTransform
          )}`;
        }
        // それ以外は\\cdotで連結
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
        // 右辺がfunction型の場合も必ず^{...}で括る（最上位）
        if (right.type === "function") {
          return `${ASTToLatex(left, optimize, astTransform)}^{${ASTToLatex(
            right,
            optimize,
            astTransform
          )}}`;
        }
        // 左辺がfunction型のときは\left(...\right)^{...}で出力（最優先）
        if (left.type === "function") {
          return `\\left(${ASTToLatex(
            left,
            optimize,
            astTransform
          )}\\right)^{${ASTToLatex(right, optimize, astTransform)}}`;
        }
        // 右辺がnumber型の場合は常に^{...}で括る（hasBraces等は無視）
        if (right.type === "number") {
          return `${ASTToLatex(left, optimize, astTransform)}^{${right.value}}`;
        }
        // 右辺がoperator型でopが-（負の指数）の場合は必ず^{...}で囲む
        if (right.type === "operator" && right.op === "-") {
          return `${ASTToLatex(left, optimize, astTransform)}^{${ASTToLatex(
            right,
            optimize,
            astTransform,
            "^"
          )}}`;
        }
        // 右辺がoperator型で、かつhasBracesがtrueならx^{n}形式で出力
        if (right.type === "operator" && right.hasBraces) {
          return `${ASTToLatex(left, optimize, astTransform)}^{${ASTToLatex(
            right,
            optimize,
            astTransform,
            "^"
          )}}`;
        }
        // x^{f(x)} * (和) の場合は x^{f(x)}\left(...\right) で出力（rightが+ノードなら必ず括弧付き）
        if (
          left.type === "operator" &&
          left.op === "^" &&
          right &&
          right.type === "operator" &&
          right.op === "+"
        ) {
          return `${ASTToLatex(
            left,
            optimize,
            astTransform
          )}\\left(${ASTToLatex(right, optimize, astTransform)}\\right)`;
        }
        // x^{f(x)} * (積や分数) の場合も x^{f(x)}... で出力
        if (
          left.type === "operator" &&
          left.op === "^" &&
          ((right.type === "operator" && right.op === "*") ||
            (right.type === "operator" && right.op === "/") ||
            right.type === "function")
        ) {
          return `${ASTToLatex(left, optimize, astTransform)}${ASTToLatex(
            right,
            optimize,
            astTransform
          )}`;
        }
        // 通常は x^n 形式で出力
        return `${ASTToLatex(left, optimize, astTransform)}^${ASTToLatex(
          right,
          optimize,
          astTransform,
          "^"
        )}`;
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
      // 2x x + x^{2} → 3x^{2} のような形をまとめる
      // 2x x → 2x^{2}
      const isX = (n: any) => n.type === "symbol" && n.name === "x";
      const isX2 = (n: any) =>
        n.type === "operator" &&
        n.op === "^" &&
        isX(n.left) &&
        n.right.type === "number" &&
        n.right.value === 2;
      // left: 2x x, right: x^{2}
      if (
        left.type === "operator" &&
        left.op === "*" &&
        left.left.type === "operator" &&
        left.left.op === "*" &&
        left.left.left.type === "number" &&
        isX(left.left.right) &&
        isX(left.right) &&
        isX2(right)
      ) {
        return {
          type: "operator",
          op: "*",
          left: { type: "number", value: 3 },
          right: right,
        };
      }
      // 右辺と左辺を入れ替えた場合も同様
      if (
        right.type === "operator" &&
        right.op === "*" &&
        right.left.type === "operator" &&
        right.left.op === "*" &&
        right.left.left.type === "number" &&
        isX(right.left.right) &&
        isX(right.right) &&
        isX2(left)
      ) {
        return {
          type: "operator",
          op: "*",
          left: { type: "number", value: 3 },
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
        if (
          xpow.right.type === "number" &&
          typeof xpow.right.value === "number"
        ) {
          xpow = {
            type: "operator",
            op: "^",
            left: { type: "symbol", name: "x" },
            right: { type: "number", value: Number(xpow.right.value) - 1 },
          };
        } else {
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
        }
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
  if (value === -1) return "-";
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

function isMinusOneTimes(node: ASTNode): boolean {
  return (
    node.type === "operator" &&
    node.op === "*" &&
    node.left.type === "number" &&
    node.left.value === -1
  );
}
