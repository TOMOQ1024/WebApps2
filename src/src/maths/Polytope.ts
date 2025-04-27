import { getCombinations } from "./CombinationUtils";
import { CoxeterNode } from "./CoxeterNode";

export class Polytope {
  nodes: CoxeterNode[] = [];
  siblings: { gens: string[]; polytope: Polytope }[] = [];
  children: { gens: string[]; polytope: Polytope }[] = [];

  // CoxeterNodeから多面体構造を構築する
  constructor(public gens: string[], public parent: Polytope | null = null) {}

  addChild(gens: string[], child: Polytope = new Polytope(gens, this)) {
    this.children.push({ gens, polytope: child });
    child.parent = this;
  }

  build() {
    if (!this.nodes.length) return;
    this.nodes[0].polytopes[this.gens.join("")] = this;

    const nodes = this.nodes[0].nodes();
    const visitedNodes = new Set<CoxeterNode>();

    // 生成元の組み合わせごとに処理
    const genCombinations = getCombinations(this.gens, this.gens.length - 1);
    for (const genCombination of genCombinations) {
      visitedNodes.clear();

      // 各ノードを起点として深さ優先探索
      for (const node of Object.values(nodes)) {
        if (visitedNodes.has(node)) continue;

        const subpolytope = new Polytope(genCombination, this);
        const stack: CoxeterNode[] = [node];

        while (stack.length > 0) {
          const currentNode = stack.pop()!;
          if (visitedNodes.has(currentNode)) continue;

          visitedNodes.add(currentNode);
          subpolytope.nodes.push(currentNode.identicalNode);
          currentNode.polytopes[genCombination.join("")] = subpolytope;

          // 生成元の組み合わせに基づいて隣接ノードを探索
          for (const gen of genCombination) {
            const nextNode = currentNode.siblings[gen];
            if (nextNode && !visitedNodes.has(nextNode)) {
              stack.push(nextNode);
            }
          }
        }

        let writeIndex = 0;
        for (let j = 0; j < subpolytope.nodes.length; j++) {
          if (
            subpolytope.nodes[j] !==
            subpolytope.nodes[(j + 1) % subpolytope.nodes.length]
          ) {
            subpolytope.nodes[writeIndex++] = subpolytope.nodes[j];
          }
        }
        subpolytope.nodes.length = writeIndex;

        if (subpolytope.nodes.length > this.gens.length - 1) {
          this.children.push({ gens: genCombination, polytope: subpolytope });
        }
      }
    }
  }
}
