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
        // それ以外は単項マイナスで返す
        return {
          type: "operator",
          op: "-",
          left: { type: "number", value: 0 },
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
        // x * (1/x) の形なら微分は0
        if (
          left.type === "symbol" &&
          left.name === variable &&
          right.type === "operator" &&
          right.op === "/" &&
          right.left.type === "number" &&
          right.left.value === 1 &&
          right.right.type === "symbol" &&
          right.right.name === variable
        ) {
          return { type: "number", value: 0 };
        }
        // (1/x) * x の形なら微分は0
        if (
          left.type === "operator" &&
          left.op === "/" &&
          left.left.type === "number" &&
          left.left.value === 1 &&
          left.right.type === "symbol" &&
          left.right.name === variable &&
          right.type === "symbol" &&
          right.name === variable
        ) {
          return { type: "number", value: 0 };
        }
        // x^a * (1/x^a) の形なら微分は0
        if (
          left.type === "operator" &&
          left.op === "^" &&
          left.left.type === "symbol" &&
          left.left.name === variable &&
          left.right.type === "number" &&
          right.type === "operator" &&
          right.op === "/" &&
          right.left.type === "number" &&
          right.left.value === 1 &&
          right.right.type === "operator" &&
          right.right.op === "^" &&
          right.right.left.type === "symbol" &&
          right.right.left.name === variable &&
          right.right.right.type === "number" &&
          left.right.value === right.right.right.value
        ) {
          return { type: "number", value: 0 };
        }
        // (1/x^a) * x^a の形なら微分は0
        if (
          left.type === "operator" &&
          left.op === "/" &&
          left.left.type === "number" &&
          left.left.value === 1 &&
          left.right.type === "operator" &&
          left.right.op === "^" &&
          left.right.left.type === "symbol" &&
          left.right.left.name === variable &&
          left.right.right.type === "number" &&
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "symbol" &&
          right.left.name === variable &&
          right.right.type === "number" &&
          left.right.right.value === right.right.value
        ) {
          return { type: "number", value: 0 };
        }

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
        // x^m / x^n の場合は x^{m-n} の形に変換して微分
        if (
          left.type === "operator" &&
          left.op === "^" &&
          left.left.type === "symbol" &&
          left.left.name === variable &&
          left.right.type === "number" &&
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "symbol" &&
          right.left.name === variable &&
          right.right.type === "number"
        ) {
          const m = left.right.value;
          const n = right.right.value;
          const newExponent = m - n;
          const powerNode = {
            type: "operator" as const,
            op: "^" as const,
            left: { type: "symbol" as const, name: variable },
            right: { type: "number" as const, value: newExponent },
          };
          return differentiateASTNode(powerNode, variable);
        }
        // x^m / x の場合
        if (
          left.type === "operator" &&
          left.op === "^" &&
          left.left.type === "symbol" &&
          left.left.name === variable &&
          left.right.type === "number" &&
          right.type === "symbol" &&
          right.name === variable
        ) {
          const m = left.right.value;
          const newExponent = m - 1;
          const powerNode = {
            type: "operator" as const,
            op: "^" as const,
            left: { type: "symbol" as const, name: variable },
            right: { type: "number" as const, value: newExponent },
          };
          return differentiateASTNode(powerNode, variable);
        }
        // x / x^n の場合
        if (
          left.type === "symbol" &&
          left.name === variable &&
          right.type === "operator" &&
          right.op === "^" &&
          right.left.type === "symbol" &&
          right.left.name === variable &&
          right.right.type === "number"
        ) {
          const n = right.right.value;
          const newExponent = 1 - n;
          const powerNode = {
            type: "operator" as const,
            op: "^" as const,
            left: { type: "symbol" as const, name: variable },
            right: { type: "number" as const, value: newExponent },
          };
          return differentiateASTNode(powerNode, variable);
        }
        // x / x の場合
        if (
          left.type === "symbol" &&
          left.name === variable &&
          right.type === "symbol" &&
          right.name === variable
        ) {
          return { type: "number", value: 0 };
        }
        // 商の微分: (f/g)' = (f'g - fg')/g^2
        const f = left;
        const g = right;
        const df = differentiateASTNode(f, variable);
        const dg = differentiateASTNode(g, variable);

        return {
          type: "operator",
          op: "/",
          left: {
            type: "operator",
            op: "-",
            left: {
              type: "operator",
              op: "*",
              left: df,
              right: g,
            },
            right: {
              type: "operator",
              op: "*",
              left: f,
              right: dg,
            },
          },
          right: {
            type: "operator",
            op: "^",
            left: g,
            right: { type: "number", value: 2 },
          },
        };
      } else if (op === "^") {
        // x^n の場合（n<0でもn*x^{n-1}の形で返す）
        if (
          left.type === "symbol" &&
          left.name === variable &&
          right.type === "number"
        ) {
          // n === -1 のときもpow形式（-x^{-2}）のみ返す。指数は必ずnumber型で返す。
          const n = right.value;
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: n },
            right: {
              type: "operator",
              op: "^",
              left: { type: "symbol", name: variable },
              right: { type: "number", value: n - 1 },
            },
          };
        }
        // x^{f/g} の場合も分数ノードを返さず、number型（小数）でpowノードを返す
        if (
          left.type === "symbol" &&
          left.name === variable &&
          right.type === "operator" &&
          right.op === "/" &&
          right.left.type === "number" &&
          right.right.type === "number"
        ) {
          const n = right.left.value / right.right.value;
          return {
            type: "operator",
            op: "*",
            left: { type: "number", value: n },
            right: {
              type: "operator",
              op: "^",
              left: { type: "symbol", name: variable },
              right: { type: "number", value: n - 1 },
            },
          };
        }
        // x^{f(x)} の場合も分数ノードを返さずpowノードのみで構成。指数が単なるnumberでない場合は式ノードのまま。
        if (
          left.type === "symbol" &&
          left.name === variable &&
          right.type !== "number"
        ) {
          return {
            type: "operator",
            op: "+",
            left: {
              type: "operator",
              op: "*",
              left: {
                type: "operator",
                op: "*",
                left: {
                  type: "operator",
                  op: "^",
                  left: { type: "symbol", name: variable },
                  right: right,
                },
                right: {
                  type: "function",
                  name: "ln",
                  args: [{ type: "symbol", name: variable }],
                },
              },
              right: differentiateASTNode(right, variable),
            },
            right: {
              type: "operator",
              op: "*",
              left: {
                type: "operator",
                op: "^",
                left: { type: "symbol", name: variable },
                right: {
                  type: "operator",
                  op: "-",
                  left: right,
                  right: { type: "number", value: 1 },
                },
              },
              right: right,
            },
          };
        }
        // e^x の場合は e^x のみ返す
        if (
          left.type === "symbol" &&
          left.name === "e" &&
          right.type === "symbol" &&
          right.name === variable
        ) {
          return {
            type: "operator",
            op: "^",
            left,
            right,
          };
        }
        // e^{f(x)} の場合は e^{f(x)} * f'(x) を返す
        if (left.type === "symbol" && left.name === "e") {
          return {
            type: "operator",
            op: "*",
            left: node,
            right: differentiateASTNode(right, variable),
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
          // sin(-x) の場合は特別に処理
          if (
            u.type === "operator" &&
            u.op === "-" &&
            u.left.type === "number" &&
            u.left.value === 0
          ) {
            return {
              type: "operator",
              op: "-",
              left: { type: "number", value: 0 },
              right: { type: "function", name: "cos", args: [u.right] },
            };
          }
          return {
            type: "operator",
            op: "*",
            left: differentiateASTNode(u, variable),
            right: { type: "function", name: "cos", args: [u] },
          };
        case "cos":
          // cos(-x) の場合は特別に処理
          if (
            u.type === "operator" &&
            u.op === "-" &&
            u.left.type === "number" &&
            u.left.value === 0
          ) {
            return {
              type: "operator",
              op: "-",
              left: { type: "number", value: 0 },
              right: { type: "function", name: "sin", args: [u.right] },
            };
          }
          return {
            type: "operator",
            op: "*",
            left: differentiateASTNode(u, variable),
            right: {
              type: "operator",
              op: "-",
              left: { type: "number", value: 0 },
              right: { type: "function", name: "sin", args: [u] },
            },
          };
        case "tan":
          return {
            type: "operator",
            op: "*",
            left: differentiateASTNode(u, variable),
            right: {
              type: "operator",
              op: "^",
              left: { type: "function", name: "sec", args: [u] },
              right: { type: "number", value: 2 },
            },
          };
        case "cot":
          return {
            type: "operator",
            op: "-",
            left: { type: "number", value: 0 },
            right: {
              type: "operator",
              op: "*",
              left: differentiateASTNode(u, variable),
              right: {
                type: "operator",
                op: "^",
                left: { type: "function", name: "csc", args: [u] },
                right: { type: "number", value: 2 },
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
            op: "-",
            left: { type: "number", value: 0 },
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
