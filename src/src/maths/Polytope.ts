import { CoxeterDynkinDiagram } from "./CoxeterDynkinDiagram";
import { CoxeterNode } from "./CoxeterNode";

export class Polytope {
  nodes: Set<CoxeterNode> = new Set();
  representativeNodes: Set<CoxeterNode> = new Set();
  siblings: {
    joint: Polytope;
    sibling: Polytope;
  }[] = [];
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

  addSibling(sibling: Polytope, joint: Polytope) {
    this.siblings.push({ joint, sibling });
    sibling.siblings.push({ joint, sibling: this });
  }

  build() {
    if (this.diagram.gens.length < 1) return;
    const root = this.nodes.values().next().value;
    if (!root) throw new Error("No root node found");
    const visitedNodes = new Set<CoxeterNode>();

    // 生成元の組み合わせごとに処理
    const rmGens = [...this.diagram.gens].reverse(); // 何故か逆順にする必要がある
    for (const rmGen of rmGens) {
      const diagram = this.diagram.withoutGens([rmGen]);
      const isVolumeless = diagram.isVolumeless();
      visitedNodes.clear();

      // 各ノードを起点として深さ優先探索
      for (const node of this.nodes) {
        if (visitedNodes.has(node)) continue;

        let subpolytope = new Polytope(diagram, new Set());
        const stack: CoxeterNode[] = [node];

        while (stack.length > 0) {
          const currentNode = stack.pop()!;

          visitedNodes.add(currentNode);
          subpolytope.nodes.add(currentNode);
          subpolytope.representativeNodes.add(currentNode.identicalNode);

          currentNode.polytopes.push(subpolytope);

          // 生成元の組み合わせに基づいて隣接ノードを探索
          for (const gen of diagram.gens) {
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
          if (subpolytope.diagram.gens.length > diagram.gens.length) {
            subpolytope.diagram = diagram;
          }
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

    for (const child of this.children) {
      for (const sibling of child.parent) {
        if (sibling === this) continue;
        this.addSibling(sibling, child);
      }
    }
  }
}
