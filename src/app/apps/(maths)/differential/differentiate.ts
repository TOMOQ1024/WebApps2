import { ASTNode } from "../../../../src/Parser/ASTNode";

// 変数名はx固定
export function differentiate(node: ASTNode, variable: string = "x"): ASTNode {
  switch (node.type) {
    case "number":
      return { type: "number", value: 0 };
    case "symbol":
      return { type: "number", value: node.name === variable ? 1 : 0 };
    case "operator": {
      const { op, left, right } = node;
      if (op === "+" || op === "-") {
        return {
          type: "operator",
          op,
          left: differentiate(left, variable),
          right: differentiate(right, variable),
        };
      } else if (op === "*") {
        // 積の微分
        return {
          type: "operator",
          op: "+",
          left: {
            type: "operator",
            op: "*",
            left: differentiate(left, variable),
            right,
          },
          right: {
            type: "operator",
            op: "*",
            left,
            right: differentiate(right, variable),
          },
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
              left: differentiate(left, variable),
              right,
            },
            right: {
              type: "operator",
              op: "*",
              left,
              right: differentiate(right, variable),
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
        // f(x)^g(x) の場合
        // d/dx f^g = f^g * (g' * ln f + g * f'/f)
        return {
          type: "operator",
          op: "*",
          left: node,
          right: {
            type: "operator",
            op: "+",
            left: {
              type: "operator",
              op: "*",
              left: differentiate(right, variable),
              right: {
                type: "function",
                name: "ln",
                args: [left],
              },
            },
            right: {
              type: "operator",
              op: "*",
              left: right,
              right: {
                type: "operator",
                op: "/",
                left: differentiate(left, variable),
                right: left,
              },
            },
          },
        };
      }
      break;
    }
    case "function": {
      const { name, args } = node;
      const u = args[0];
      switch (name) {
        case "sin":
          return {
            type: "operator",
            op: "*",
            left: { type: "function", name: "cos", args: [u] },
            right: differentiate(u, variable),
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
              right: differentiate(u, variable),
            },
          };
        case "tan":
          return {
            type: "operator",
            op: "/",
            left: differentiate(u, variable),
            right: {
              type: "operator",
              op: "*",
              left: { type: "function", name: "cos", args: [u] },
              right: { type: "function", name: "cos", args: [u] },
            },
          };
        case "exp":
          return {
            type: "operator",
            op: "*",
            left: node,
            right: differentiate(u, variable),
          };
        case "log":
        case "ln":
          return {
            type: "operator",
            op: "/",
            left: differentiate(u, variable),
            right: u,
          };
        case "sqrt":
          return {
            type: "operator",
            op: "/",
            left: differentiate(u, variable),
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
