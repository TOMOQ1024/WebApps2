import { ASTNode } from "../ASTNode";

// ASTを正規化する（a-b → a+(-b), a/b → a*(b^(-1))）
export function normalizeAST(node: ASTNode): ASTNode {
  if (node.type === "operator") {
    // 係数と複合式の乗算は絶対に正規化しない（9(π^x + sin x) のような形）
    if (
      node.op === "*" &&
      node.left.type === "number" &&
      node.right.type === "operator" &&
      (node.right.op === "+" || node.right.op === "-")
    ) {
      // 右側の複合式だけを正規化して、乗算構造は保持
      return {
        type: "operator",
        op: "*",
        left: node.left,
        right: normalizeAST(node.right),
      };
    }

    // 複合式の加算・減算は正規化しない
    if (
      ((node.op === "+" || node.op === "-") &&
        node.left.type === "operator" &&
        (node.left.op === "+" || node.left.op === "-")) ||
      (node.right.type === "operator" &&
        (node.right.op === "+" || node.right.op === "-"))
    ) {
      // 子ノードを再帰的に正規化するが、構造は保持
      return {
        ...node,
        left: normalizeAST(node.left),
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
