import { CoxeterNode } from "@/src/maths/CoxeterNode";

/**
 * 代表ノードを取得する
 */
export function GetRepresentativeNodes(nodes: { [key: string]: CoxeterNode }) {
  const representativeNodes: Set<CoxeterNode> = new Set();
  let n: CoxeterNode;

  Object.keys(nodes).forEach((c) => {
    n = nodes[c].identicalNodes.values().next().value!;
    representativeNodes.add(n);
  });
  return representativeNodes;
}
