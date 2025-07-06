import { ASTNode } from "../ASTNode";

// 加算項を平坦化
export function flattenAddition(left: ASTNode, right: ASTNode): ASTNode[] {
  const terms: ASTNode[] = [];

  const collect = (node: ASTNode) => {
    if (node.type === "operator" && node.op === "+") {
      collect(node.left);
      collect(node.right);
    } else {
      terms.push(node);
    }
  };

  collect(left);
  collect(right);

  return terms;
}
