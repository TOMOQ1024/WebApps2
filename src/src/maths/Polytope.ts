import { CoxeterDynkinDiagram } from "./CoxeterDynkinDiagram";
import { CoxeterNode } from "./CoxeterNode";

export class Polytope {
  nodes: Set<CoxeterNode> = new Set();
  identicalNodeSets: Set<Set<CoxeterNode>> = new Set();
  siblings: Map<Polytope, Polytope> = new Map(); // sibling, joint
  children: Set<Polytope> = new Set();
  visibility: boolean = true;

  private nodeCache: Map<string, Set<CoxeterNode>> = new Map();
  private alternativeCache: Map<string, Polytope | undefined> = new Map();

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
    this.siblings.set(sibling, joint);
    sibling.siblings.set(this, joint);
  }

  build() {
    if (this.diagram.gens.length < 1) return;
    const root = this.nodes.values().next().value;
    if (!root) throw new Error("No root node found");

    // 生成元の組み合わせごとに処理
    const rmGens = [...this.diagram.gens];
    for (const rmGen of rmGens) {
      const diagram = this.diagram.withoutGens([rmGen]);
      const isVolumeless = diagram.isVolumeless();
      const visitedNodes = new Set<CoxeterNode>();

      // 各ノードを起点として深さ優先探索
      for (const node of this.nodes) {
        if (visitedNodes.has(node)) continue;

        const cacheKey = this.getCacheKey(node, diagram);
        let nodesToProcess: Set<CoxeterNode>;

        if (this.nodeCache.has(cacheKey)) {
          nodesToProcess = this.nodeCache.get(cacheKey)!;
          for (const n of nodesToProcess) {
            visitedNodes.add(n);
          }
        } else {
          const subpolytope = new Polytope(diagram, new Set());
          const stack: CoxeterNode[] = [node];
          nodesToProcess = new Set<CoxeterNode>();

          // ノードの収集フェーズ
          while (stack.length > 0) {
            const currentNode = stack.pop()!;
            if (visitedNodes.has(currentNode)) continue;

            visitedNodes.add(currentNode);
            nodesToProcess.add(currentNode);

            // 隣接ノードの探索
            for (const gen of diagram.gens) {
              const nextNode = currentNode.siblings[gen];
              if (nextNode && !visitedNodes.has(nextNode)) {
                stack.push(nextNode);
              }
            }
          }
          this.nodeCache.set(cacheKey, nodesToProcess);
        }

        const subpolytope = new Polytope(diagram, new Set());
        // 一括処理フェーズ
        for (const currentNode of nodesToProcess) {
          subpolytope.nodes.add(currentNode);
          subpolytope.identicalNodeSets.add(currentNode.identicalNodes);
          currentNode.identicalNodes.forEach((node) => {
            node.polytopes.push(subpolytope);
          });
        }

        const alternativeCacheKey = this.getAlternativeCacheKey(
          node,
          subpolytope
        );
        let alternativeSubpolytope: Polytope | undefined;

        if (this.alternativeCache.has(alternativeCacheKey)) {
          alternativeSubpolytope =
            this.alternativeCache.get(alternativeCacheKey);
        } else {
          alternativeSubpolytope = node.polytopes.find(
            (p) =>
              p !== subpolytope &&
              p.visibility &&
              p.identicalNodeSets.symmetricDifference(
                subpolytope.identicalNodeSets
              ).size === 0
          );
          this.alternativeCache.set(
            alternativeCacheKey,
            alternativeSubpolytope
          );
        }

        if (alternativeSubpolytope) {
          subpolytope.visibility = false;
          if (
            alternativeSubpolytope.diagram.gens.length > diagram.gens.length
          ) {
            alternativeSubpolytope.diagram = diagram;
          }
          this.processSubpolytope(alternativeSubpolytope, isVolumeless);
        } else {
          this.processSubpolytope(subpolytope, isVolumeless);
        }
      }
    }

    this.updateSiblingRelations();
  }

  private processSubpolytope(subpolytope: Polytope, isVolumeless: boolean) {
    if (!isVolumeless && this.isUniqueChild(subpolytope)) {
      subpolytope.visibility = true;
      this.addChild(subpolytope);
      subpolytope.build();
    }
  }

  private isUniqueChild(subpolytope: Polytope): boolean {
    return ![...this.children.values()].some(
      (c) =>
        c.identicalNodeSets.symmetricDifference(subpolytope.identicalNodeSets)
          .size === 0
    );
  }

  private updateSiblingRelations() {
    for (const child of this.children) {
      for (const sibling of child.parent) {
        if (sibling === this) continue;
        this.addSibling(sibling, child);
      }
    }
  }

  private getCacheKey(
    node: CoxeterNode,
    diagram: CoxeterDynkinDiagram
  ): string {
    return `${node.coordinate}-${diagram.gens.sort().join(",")}`;
  }

  private getAlternativeCacheKey(
    node: CoxeterNode,
    subpolytope: Polytope
  ): string {
    return `${node.coordinate}-${[...subpolytope.identicalNodeSets]
      .map((set) =>
        [...set]
          .map((n) => n.coordinate)
          .sort()
          .join(",")
      )
      .sort()
      .join("|")}`;
  }
}
