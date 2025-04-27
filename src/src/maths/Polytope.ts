import { getCombinations } from "./CombinationUtils";
import { CoxeterDynkinDiagram, CoxeterNode } from "./CoxeterNode";

export class Polytope {
  nodes: Set<CoxeterNode> = new Set();
  siblings: Set<Polytope> = new Set();
  children: Set<Polytope> = new Set();
  visibility: boolean = true;

  // CoxeterNodeから多面体構造を構築する
  constructor(
    public diagram: CoxeterDynkinDiagram,
    public parent: Set<Polytope> = new Set()
  ) {}

  addChild(child: Polytope) {
    this.children.add(child);
    child.parent.add(this);
  }

  build() {
    if (this.diagram.gens.length < 1) return;
    const root = this.nodes.values().next().value;
    if (!root) return;

    const nodes = Object.values(root.nodes(this.diagram.gens));
    const visitedNodes = new Set<CoxeterNode>();

    // 生成元の組み合わせごとに処理
    const genCombinations = getCombinations(
      this.diagram.gens,
      this.diagram.gens.length - 1
    );
    for (const genCombination of genCombinations) {
      visitedNodes.clear();

      // 各ノードを起点として深さ優先探索
      for (const node of nodes) {
        if (visitedNodes.has(node)) continue;

        let subpolytope = new Polytope(
          this.diagram.withNodes(genCombination),
          new Set([this])
        );
        const stack: CoxeterNode[] = [node];

        let alternated = false;
        while (stack.length > 0) {
          const currentNode = stack.pop()!;

          visitedNodes.add(currentNode);
          subpolytope.nodes.add(currentNode.identicalNode);
          const alternateSubpolytope = currentNode.polytopes.find(
            (p) => p.diagram.gens.join("") === genCombination.join("")
          );
          if (alternateSubpolytope) {
            alternateSubpolytope.nodes = subpolytope.nodes;
            subpolytope = alternateSubpolytope;
            alternated = true;
          } else {
            currentNode.polytopes.push(subpolytope);
          }

          // 生成元の組み合わせに基づいて隣接ノードを探索
          for (const gen of genCombination) {
            const nextNode = currentNode.siblings[gen];
            if (nextNode && !visitedNodes.has(nextNode)) {
              stack.push(nextNode);
            }
          }
        }

        let volumeless = subpolytope.diagram.isVolumeless();

        if (
          // subpolytope.nodes.size <= this.diagram.gens.length - 1 ||
          volumeless
        ) {
          subpolytope.visibility = false;
        } else if (
          [...this.children.values()].findIndex(
            (c) => c.nodes.symmetricDifference(subpolytope.nodes).size === 0
          ) === -1
        ) {
          this.addChild(subpolytope);
        }
      }
    }
    this.children.forEach((child) => {
      child.build();
    });
  }
}
