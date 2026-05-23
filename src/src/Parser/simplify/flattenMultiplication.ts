import { ASTNode } from "../ASTNode";

// 乗算項を平坦化
export function flattenMultiplication(
  left: ASTNode,
  right: ASTNode
): ASTNode[] {
  const factors: ASTNode[] = [];

  const collect = (node: ASTNode) => {
    if (node.type === "operator" && node.op === "*") {
      collect(node.left);
      collect(node.right);
    } else {
      factors.push(node);
    }
  };

  collect(left);
  collect(right);

  return factors;
}
