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
        return {
          type: "operator",
          op: "-",
          left: { type: "number", value: 0 },
          right: differentiateASTNode(right, variable),
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

        // 積の微分: (fg)' = f'g + fg'
        return {
          type: "operator",
          op: "+",
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
          return differentiateASTNode(
            {
              type: "operator",
              op: "^",
              left: { type: "symbol", name: variable },
              right: { type: "number", value: newExponent },
            },
            variable
          );
        }

        // x^m / x の場合は x^{m-1} の形に変換して微分
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
          return differentiateASTNode(
            {
              type: "operator",
              op: "^",
              left: { type: "symbol", name: variable },
              right: { type: "number", value: newExponent },
            },
            variable
          );
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
        // x^n の場合
        if (
          left.type === "symbol" &&
          left.name === variable &&
          right.type === "number"
        ) {
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

        // x^{f/g} の場合（分数指数）
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

        // e^x の場合
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

        // e^{f(x)} の場合
        if (left.type === "symbol" && left.name === "e") {
          return {
            type: "operator",
            op: "*",
            left: node,
            right: differentiateASTNode(right, variable),
          };
        }

        // x^{f(x)} の場合
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
                left: node,
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

        // f(x)^g(x) の場合
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

      const du = differentiateASTNode(u, variable);

      switch (name) {
        case "sin":
          return {
            type: "operator",
            op: "*",
            left: du,
            right: { type: "function", name: "cos", args: [u] },
          };
        case "cos":
          return {
            type: "operator",
            op: "*",
            left: du,
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
            left: du,
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
              left: du,
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
              right: du,
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
                right: du,
              },
            },
          };
        case "sinh":
          return {
            type: "operator",
            op: "*",
            left: { type: "function", name: "cosh", args: [u] },
            right: du,
          };
        case "cosh":
          return {
            type: "operator",
            op: "*",
            left: { type: "function", name: "sinh", args: [u] },
            right: du,
          };
        case "tanh":
          return {
            type: "operator",
            op: "*",
            left: du,
            right: {
              type: "operator",
              op: "/",
              left: { type: "number", value: 1 },
              right: {
                type: "operator",
                op: "^",
                left: { type: "function", name: "cosh", args: [u] },
                right: { type: "number", value: 2 },
              },
            },
          };
        case "exp":
          return {
            type: "operator",
            op: "*",
            left: node,
            right: du,
          };
        case "log":
        case "ln":
          return {
            type: "operator",
            op: "/",
            left: du,
            right: u,
          };
        case "sqrt":
          return {
            type: "operator",
            op: "/",
            left: du,
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
