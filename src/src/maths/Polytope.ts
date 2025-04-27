import { getCombinations } from "./CombinationUtils";
import { CoxeterDynkinDiagram, CoxeterNode } from "./CoxeterNode";

export class Polytope {
  nodes: Set<CoxeterNode> = new Set();
  siblings: Polytope[] = [];
  children: Polytope[] = [];
  visibility: boolean = true;

  // CoxeterNodeから多面体構造を構築する
  constructor(
    public gens: string[],
    public diagram: CoxeterDynkinDiagram,
    public parent: Polytope[] = []
  ) {}

  addChild(child: Polytope) {
    this.children.push(child);
    child.parent.push(this);
  }

  build() {
    if (this.gens.length <= 1) return;
    const root = this.nodes.values().next().value;
    if (!root) return;

    const nodes = Object.values(root.nodes());
    const visitedNodes = new Set<CoxeterNode>();

    // 生成元の組み合わせごとに処理
    const genCombinations = getCombinations(this.gens, this.gens.length - 1);
    for (const genCombination of genCombinations) {
      visitedNodes.clear();

      // 各ノードを起点として深さ優先探索
      for (const node of nodes) {
        if (visitedNodes.has(node)) continue;

        let subpolytope = new Polytope(genCombination, this.diagram, [this]);
        const stack: CoxeterNode[] = [node];

        let flag = false;
        while (stack.length > 0) {
          const currentNode = stack.pop()!;

          visitedNodes.add(currentNode);
          subpolytope.nodes.add(currentNode.identicalNode);
          const alternateSubpolytope = currentNode.polytopes.find(
            (p) => p.gens.join("") === genCombination.join("")
          );
          if (alternateSubpolytope) {
            alternateSubpolytope.nodes = subpolytope.nodes;
            subpolytope = alternateSubpolytope;
            alternateSubpolytope.parent.push(this);
            flag = true;
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

        if (!flag) {
          for (const gen of genCombination) {
            if (this.diagram.nodeMarks[gen] === "o") {
              let f = true;
              for (const gen2 of genCombination) {
                if (gen === gen2) continue;
                const label = this.diagram.labels[`${gen}${gen2}`];
                if (label[0] / label[1] !== 2) {
                  f = false;
                }
              }
              if (f) flag = true;
            }
          }
        }

        if (subpolytope.nodes.size <= this.gens.length - 1 || flag) {
          subpolytope.visibility = false;
        } else if (
          this.children.findIndex(
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
