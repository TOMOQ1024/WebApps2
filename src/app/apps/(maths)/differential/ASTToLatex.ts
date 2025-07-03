import { ASTNode } from "../../../../src/Parser/ASTNode";

export function ASTToLatex(node: ASTNode): string {
  switch (node.type) {
    case "number":
      return node.value.toString();
    case "symbol":
      return node.name;
    case "operator": {
      const { op, left, right } = node;
      if (op === "+" || op === "-") {
        return `${ASTToLatex(left)} ${op} ${ASTToLatex(right)}`;
      } else if (op === "*") {
        return `${wrapIfNeeded(left, op)} \\cdot ${wrapIfNeeded(right, op)}`;
      } else if (op === "/") {
        return `\\frac{${ASTToLatex(left)}}{${ASTToLatex(right)}}`;
      } else if (op === "^") {
        return `{${ASTToLatex(left)}}^{${ASTToLatex(right)}}`;
      }
      break;
    }
    case "function": {
      const { name, args } = node;
      if (name === "sqrt") {
        return `\\sqrt{${ASTToLatex(args[0])}}`;
      } else if (name === "ln" || name === "log") {
        return `\\${name} ${wrapIfNeeded(args[0], "func")}`;
      } else {
        return `\\${name} ${wrapIfNeeded(args[0], "func")}`;
      }
    }
  }
  return "";
}

function wrapIfNeeded(node: ASTNode, parentOp: string): string {
  if (node.type === "operator") {
    if (parentOp === "*" && (node.op === "+" || node.op === "-")) {
      return `(${ASTToLatex(node)})`;
    }
    if (parentOp === "func" && (node.op === "+" || node.op === "-")) {
      return `(${ASTToLatex(node)})`;
    }
  }
  return ASTToLatex(node);
}
