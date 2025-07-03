import { ASTNode } from "../ASTNode";

// 変数名はx固定
export function differentiateASTNode(
  node: ASTNode,
  variable: string = "x"
): ASTNode {
  switch (node.type) {
    case "number":
      return { type: "number", value: 0 };
    case "symbol":
      return { type: "number", value: node.name === variable ? 1 : 0 };
    case "operator": {
      const { op, left, right } = node;
      // 単項マイナスの微分: d/dx(-f(x)) = -f'(x)
      if (op === "-" && left.type === "number" && left.value === 0) {
        const d = differentiateASTNode(right, variable);
        // すでに -1 * ... なら符号を反転
        if (
          d.type === "operator" &&
          d.op === "*" &&
          d.left.type === "number" &&
          d.left.value === -1
        ) {
          return d.right;
        }
        // すでに単項マイナスなら符号を反転
        if (
          d.type === "operator" &&
          d.op === "-" &&
          d.left.type === "number" &&
          d.left.value === 0
        ) {
          return d.right;
        }
        // それ以外は -1 * d
        return {
          type: "operator",
          op: "*",
          left: { type: "number", value: -1 },
          right: d,
        };
      }
      if (op === "+" || op === "-") {
        return {
          type: "operator",
          op,
          left: differentiateASTNode(left, variable),
          right: differentiateASTNode(right, variable),
        };
      } else if (op === "*") {
        // x*x*x... の形なら簡約化
        const simp = simplifyProductToPower(node, variable);
        if (simp) {
          return differentiateASTNode(simp, variable);
        }
        // 積の微分
        let dLeft = differentiateASTNode(left, variable);
        let dRight = differentiateASTNode(right, variable);
        // 微分後も積の簡約化を試みる
        if (dLeft.type === "operator" && dLeft.op === "*") {
          const simpLeft = simplifyProductToPower(dLeft, variable);
          if (simpLeft) dLeft = simpLeft;
        }
        if (dRight.type === "operator" && dRight.op === "*") {
          const simpRight = simplifyProductToPower(dRight, variable);
          if (simpRight) dRight = simpRight;
        }
        return {
          type: "operator",
          op: "+",
          left: { type: "operator", op: "*", left: dLeft, right },
          right: { type: "operator", op: "*", left, right: dRight },
        };
      } else if (op === "/") {
        // 商の微分
        return {
          type: "operator",
          op: "/",
          left: {
            type: "operator",
            op: "-",
            left: {
              type: "operator",
              op: "*",
              left: differentiateASTNode(left, variable),
              right,
            },
            right: {
              type: "operator",
              op: "*",
              left,
              right: differentiateASTNode(right, variable),
            },
          },
          right: {
            type: "operator",
            op: "*",
            left: right,
            right: right,
          },
        };
      } else if (op === "^") {
        // 冪関数の微分
        // x^n型のときは (x^n)' = n x^{n-1}
        if (
          left.type === "symbol" &&
          left.name === variable &&
          (right.type === "number" ||
            (right.type === "operator" &&
              right.op === "/" &&
              right.left.type === "number" &&
              right.right.type === "number"))
        ) {
          // 分数表現をnumberに変換
          let expValue: number;
          if (right.type === "number") {
            expValue = right.value;
          } else {
            expValue = right.left.value / right.right.value;
          }
          const newExp = expValue - 1;
          let expNode: any;
          if (newExp < 0) {
            expNode = {
              type: "number",
              value: newExp,
            };
          } else {
            expNode = {
              type: "number",
              value: newExp,
            };
          }
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: expValue },
            right: {
              type: "operator",
              op: "^",
              left,
              right: expNode,
            },
          };
        }
        // f(x)^g(x) の場合
        // d/dx f^g = f^g * (g' * ln f + g * f'/f)
        return {
          type: "operator",
          op: "+",
          left: {
            type: "operator",
            op: "*",
            left: node,
            right: {
              type: "operator",
              op: "*",
              left: differentiateASTNode(right, variable),
              right: {
                type: "function",
                name: "ln",
                args: [left],
              },
            },
          },
          right: {
            type: "operator",
            op: "*",
            left: node,
            right: {
              type: "operator",
              op: "/",
              left: {
                type: "operator",
                op: "*",
                left: right,
                right: differentiateASTNode(left, variable),
              },
              right: left,
            },
          },
        };
      }
      break;
    }
    case "function": {
      const { name, args } = node;
      const u = args[0];
      if (!u) return { type: "number", value: 0 };
      switch (name) {
        case "sin":
          return {
            type: "operator",
            op: "*",
            left: differentiateASTNode(u, variable),
            right: { type: "function", name: "cos", args: [u] },
          };
        case "cos":
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: -1 },
            right: {
              type: "operator",
              op: "*",
              left: { type: "function", name: "sin", args: [u] },
              right: differentiateASTNode(u, variable),
            },
          };
        case "tan":
          return {
            type: "operator",
            op: "/",
            left: differentiateASTNode(u, variable),
            right: {
              type: "operator",
              op: "*",
              left: { type: "function", name: "cos", args: [u] },
              right: { type: "function", name: "cos", args: [u] },
            },
          };
        case "cot":
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: -1 },
            right: {
              type: "operator",
              op: "/",
              left: differentiateASTNode(u, variable),
              right: {
                type: "operator",
                op: "*",
                left: { type: "function", name: "sin", args: [u] },
                right: { type: "function", name: "sin", args: [u] },
              },
            },
          };
        case "sec":
          return {
            type: "operator",
            op: "*",
            left: { type: "function", name: "sec", args: [u] },
            right: {
              type: "operator",
              op: "*",
              left: { type: "function", name: "tan", args: [u] },
              right: differentiateASTNode(u, variable),
            },
          };
        case "csc":
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: -1 },
            right: {
              type: "operator",
              op: "*",
              left: { type: "function", name: "csc", args: [u] },
              right: {
                type: "operator",
                op: "*",
                left: { type: "function", name: "cot", args: [u] },
                right: differentiateASTNode(u, variable),
              },
            },
          };
        case "sinh":
          return {
            type: "operator",
            op: "*",
            left: { type: "function", name: "cosh", args: [u] },
            right: differentiateASTNode(u, variable),
          };
        case "cosh":
          return {
            type: "operator",
            op: "*",
            left: { type: "function", name: "sinh", args: [u] },
            right: differentiateASTNode(u, variable),
          };
        case "tanh":
          return {
            type: "operator",
            op: "/",
            left: differentiateASTNode(u, variable),
            right: {
              type: "operator",
              op: "*",
              left: { type: "function", name: "cosh", args: [u] },
              right: { type: "function", name: "cosh", args: [u] },
            },
          };
        case "coth":
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: -1 },
            right: {
              type: "operator",
              op: "/",
              left: differentiateASTNode(u, variable),
              right: {
                type: "operator",
                op: "*",
                left: { type: "function", name: "sinh", args: [u] },
                right: { type: "function", name: "sinh", args: [u] },
              },
            },
          };
        case "sech":
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: -1 },
            right: {
              type: "operator",
              op: "*",
              left: { type: "function", name: "sech", args: [u] },
              right: {
                type: "function",
                name: "tanh",
                args: [u],
              },
            },
          };
        case "csch":
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: -1 },
            right: {
              type: "operator",
              op: "*",
              left: { type: "function", name: "csch", args: [u] },
              right: {
                type: "function",
                name: "coth",
                args: [u],
              },
            },
          };
        case "exp":
          return {
            type: "operator",
            op: "*",
            left: node,
            right: differentiateASTNode(u, variable),
          };
        case "log":
        case "ln":
          return {
            type: "operator",
            op: "/",
            left: differentiateASTNode(u, variable),
            right: u,
          };
        case "sqrt":
          return {
            type: "operator",
            op: "/",
            left: differentiateASTNode(u, variable),
            right: {
              type: "operator",
              op: "*",
              left: { type: "number", value: 2 },
              right: { type: "function", name: "sqrt", args: [u] },
            },
          };
        default:
          // 未対応関数は0
          return { type: "number", value: 0 };
      }
    }
  }
  // 未対応ノード
  return { type: "number", value: 0 };
}

// 積の連続した同じ変数（例: x*x*x）を検出し、n*x^{n-1} 形式に簡約化する関数
function simplifyProductToPower(
  node: ASTNode,
  variable: string
): ASTNode | null {
  // x*x*x... の形かどうか再帰的に判定
  let count = 0;
  let current = node;
  while (current.type === "operator" && current.op === "*") {
    if (current.right.type === "symbol" && current.right.name === variable) {
      count++;
    } else {
      return null;
    }
    if (current.left.type === "symbol" && current.left.name === variable) {
      count++;
      break;
    }
    current = current.left;
  }
  // x*x → count=2, x*x*x → count=3 となるように
  if (count >= 2) {
    return {
      type: "operator",
      op: "^",
      left: { type: "symbol", name: variable },
      right: { type: "number", value: count },
    };
  }
  return null;
}
