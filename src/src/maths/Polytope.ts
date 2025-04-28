import { getCombinations } from "./CombinationUtils";
import { CoxeterDynkinDiagram, CoxeterNode } from "./CoxeterNode";

export class Polytope {
  nodes: Set<CoxeterNode> = new Set();
  representativeNodes: Set<CoxeterNode> = new Set();
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
    if (!root) throw new Error("No root node found");
    const visitedNodes = new Set<CoxeterNode>();

    // 生成元の組み合わせごとに処理
    const genCombinations = getCombinations(
      this.diagram.gens,
      this.diagram.gens.length - 1
    );
    for (const genCombination of genCombinations) {
      visitedNodes.clear();

      // 各ノードを起点として深さ優先探索
      for (const node of this.nodes) {
        if (visitedNodes.has(node)) continue;

        const diagram = this.diagram.withNodes(genCombination);
        const isVolumeless = diagram.isVolumeless();
        let subpolytope = new Polytope(diagram, new Set());
        const stack: CoxeterNode[] = [node];

        while (stack.length > 0) {
          const currentNode = stack.pop()!;

          visitedNodes.add(currentNode);
          subpolytope.nodes.add(currentNode);
          subpolytope.representativeNodes.add(currentNode.identicalNode);

          currentNode.polytopes.push(subpolytope);

          // 生成元の組み合わせに基づいて隣接ノードを探索
          for (const gen of genCombination) {
            const nextNode = currentNode.siblings[gen];
            if (nextNode && !visitedNodes.has(nextNode)) {
              stack.push(nextNode);
            }
          }
        }

        const alternativeSubpolytope = node.polytopes.find(
          (p) =>
            p !== subpolytope &&
            p.representativeNodes.symmetricDifference(
              subpolytope.representativeNodes
            ).size === 0
        );

        if (alternativeSubpolytope) {
          subpolytope = alternativeSubpolytope;
          subpolytope.diagram = diagram;
        }

        if (isVolumeless) {
          subpolytope.visibility = false;
        } else if (
          alternativeSubpolytope ||
          [...this.children.values()].findIndex(
            (c) =>
              c.representativeNodes.symmetricDifference(
                subpolytope.representativeNodes
              ).size === 0
          ) === -1
        ) {
          subpolytope.visibility = true;
          this.addChild(subpolytope);
          subpolytope.build();
        }
      }
    }
  }
}
