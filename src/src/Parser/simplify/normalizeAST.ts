import { ASTNode } from "../ASTNode";

// ASTを正規化する（a-b → a+(-b), a/b → a*(b^(-1))）
export function normalizeAST(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    // 乗算で係数と複合式の組み合わせの場合は特別扱い
    if (
      node.op === "*" &&
      node.left.type === "number" &&
      node.right.type === "operator" &&
      (node.right.op === "+" || node.right.op === "-")
    ) {
      // 係数と複合式の乗算は正規化せずにそのまま保持
      return {
        type: "operator",
        op: "*",
        left: node.left,
        right: normalizeAST(node.right),
      };
    }

    const left = normalizeAST(node.left);
    const right = normalizeAST(node.right);

    switch (node.op) {
      case "-":
        // a - b → a + (-b)
        return {
          type: "operator",
          op: "+",
          left: left,
          right: {
            type: "operator",
            op: "*",
            left: { type: "number", value: -1 },
            right: right,
          },
        };

      case "/":
        // a / b → a * (b^(-1))
        return {
          type: "operator",
          op: "*",
          left: left,
          right: {
            type: "operator",
            op: "^",
            left: right,
            right: { type: "number", value: -1 },
          },
        };

      default:
        return { ...node, left, right };
    }
  } else if (node.type === "function") {
    return { ...node, args: node.args.map(normalizeAST) };
  }

  return node;
}
