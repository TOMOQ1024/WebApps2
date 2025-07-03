import { ASTNode } from "@/src/Parser/ASTNode";

export function ASTToLatex(node: ASTNode, optimize: boolean = false): string {
  if (optimize) {
    node = optimizeAST(node);
  }
  switch (node.type) {
    case "number":
      return node.value.toString();
    case "symbol":
      return node.name;
    case "operator": {
      const { op, left, right } = node;
      if (op === "+" || op === "-") {
        return `${ASTToLatex(left, optimize)} ${op} ${ASTToLatex(
          right,
          optimize
        )}`;
      } else if (op === "*") {
        // 積の最適化: 数値定数を左にまとめる
        const [coef, rest] = extractNumericCoefficient(node);
        if (coef !== 1) {
          // -1の場合はマイナス記号のみ
          if (coef === -1) {
            return `-${wrapIfNeeded(rest, op, optimize)}`;
          } else {
            return `${coef}${
              wrapIfNeeded(rest, op, optimize).startsWith("\\") ? "" : ""
            }${wrapIfNeeded(rest, op, optimize)}`;
          }
        }
        return `${wrapIfNeeded(left, op, optimize)} \\cdot ${wrapIfNeeded(
          right,
          op,
          optimize
        )}`;
      } else if (op === "/") {
        return `\\frac{${ASTToLatex(left, optimize)}}{${ASTToLatex(
          right,
          optimize
        )}}`;
      } else if (op === "^") {
        return `{${ASTToLatex(left, optimize)}}^{${ASTToLatex(
          right,
          optimize
        )}}`;
      }
      break;
    }
    case "function": {
      const { name, args } = node;
      if (name === "sqrt") {
        return `\\sqrt{${ASTToLatex(args[0], optimize)}}`;
      } else if (name === "ln" || name === "log") {
        return `\\${name} ${wrapIfNeeded(args[0], "func", optimize)}`;
      } else {
        return `\\${name} ${wrapIfNeeded(args[0], "func", optimize)}`;
      }
    }
  }
  return "";
}

function wrapIfNeeded(
  node: ASTNode,
  parentOp: string,
  optimize: boolean
): string {
  if (node.type === "operator") {
    if (parentOp === "*" && (node.op === "+" || node.op === "-")) {
      return `(${ASTToLatex(node, optimize)})`;
    }
    if (parentOp === "func" && (node.op === "+" || node.op === "-")) {
      return `(${ASTToLatex(node, optimize)})`;
    }
  }
  return ASTToLatex(node, optimize);
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
      // 数値定数の積をまとめる
      if (
        left.type === "number" &&
        right.type === "operator" &&
        right.op === "*"
      ) {
        const [coef, rest] = extractNumericCoefficient(right);
        if (coef !== 1) {
          return optimizeAST({
            type: "operator",
            op: "*",
            left: { type: "number", value: left.value * coef },
            right: rest,
          });
        }
      }
      if (
        right.type === "number" &&
        left.type === "operator" &&
        left.op === "*"
      ) {
        const [coef, rest] = extractNumericCoefficient(left);
        if (coef !== 1) {
          return optimizeAST({
            type: "operator",
            op: "*",
            left: { type: "number", value: right.value * coef },
            right: rest,
          });
        }
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
    }
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
