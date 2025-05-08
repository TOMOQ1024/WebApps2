import { CoxeterDynkinDiagram } from "./CoxeterDynkinDiagram";
import { CoxeterNode } from "./CoxeterNode";

// カスタムSetのsymmetricDifference実装（パフォーマンス向上のため）
function symmetricDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const result = new Set<T>();

  // setAにあってsetBにない要素を追加
  for (const elem of setA) {
    if (!setB.has(elem)) {
      result.add(elem);
    }
  }

  // setBにあってsetAにない要素を追加
  for (const elem of setB) {
    if (!setA.has(elem)) {
      result.add(elem);
    }
  }

  return result;
}

export class Polytope {
  nodes: Set<CoxeterNode> = new Set();
  identicalNodeSets: Set<Set<CoxeterNode>> = new Set();
  siblings: Map<Polytope, Polytope> = new Map(); // sibling, joint
  children: Set<Polytope> = new Set();
  visibility: boolean = true;

  private nodeCache: Map<string, Set<CoxeterNode>> = new Map();
  private alternativeCache: Map<string, Polytope | undefined> = new Map();
  // 生成元の組み合わせごとのダイアグラムをキャッシュ
  private diagramCache: Map<string, CoxeterDynkinDiagram> = new Map();

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

    // 事前に処理するノードのセットを構築
    const allNodes = new Set(this.nodes);
    const visitedNodesMap = new Map<string, Set<CoxeterNode>>();

    for (const rmGen of rmGens) {
      // 重要なダイアグラムのキャッシュを利用
      const diagramKey = rmGen;
      let diagram: CoxeterDynkinDiagram;

      if (this.diagramCache.has(diagramKey)) {
        diagram = this.diagramCache.get(diagramKey)!;
      } else {
        diagram = this.diagram.withoutGens([rmGen]);
        this.diagramCache.set(diagramKey, diagram);
      }

      const isVolumeless = diagram.isVolumeless();
      const visitedNodes = new Set<CoxeterNode>();

      // 各ノードを起点として深さ優先探索
      for (const node of allNodes) {
        if (visitedNodes.has(node)) continue;

        const cacheKey = this.getCacheKey(node, diagram);
        let nodesToProcess: Set<CoxeterNode>;

        if (this.nodeCache.has(cacheKey)) {
          nodesToProcess = this.nodeCache.get(cacheKey)!;
          for (const n of nodesToProcess) {
            visitedNodes.add(n);
          }
        } else {
          const stack: CoxeterNode[] = [node];
          nodesToProcess = new Set<CoxeterNode>();

          // ノードの収集フェーズ - パフォーマンス改善
          while (stack.length > 0) {
            const currentNode = stack.pop()!;
            if (visitedNodes.has(currentNode)) continue;

            visitedNodes.add(currentNode);
            nodesToProcess.add(currentNode);

            // 隣接ノードの探索 - より効率的なループ
            const diagramGens = diagram.gens;
            for (let i = 0; i < diagramGens.length; i++) {
              const gen = diagramGens[i];
              const nextNode = currentNode.siblings[gen];
              if (nextNode && !visitedNodes.has(nextNode)) {
                stack.push(nextNode);
              }
            }
          }
          this.nodeCache.set(cacheKey, nodesToProcess);
        }

        const subpolytope = new Polytope(diagram, new Set());

        // 一括処理フェーズ - パフォーマンス改善
        for (const currentNode of nodesToProcess) {
          subpolytope.nodes.add(currentNode);
          subpolytope.identicalNodeSets.add(currentNode.identicalNodes);

          // 効率化: .forEach() ループを回避
          for (const n of currentNode.identicalNodes) {
            n.polytopes.push(subpolytope);
          }
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
          // 最適化: カスタム実装の symmetricDifference を使用
          alternativeSubpolytope = node.polytopes.find((p) => {
            if (p === subpolytope || !p.visibility) return false;

            // 両方のセットのサイズが異なる場合、対称差分は必ず空ではない
            if (p.identicalNodeSets.size !== subpolytope.identicalNodeSets.size)
              return false;

            // カスタム実装を使用
            return (
              symmetricDifference(
                p.identicalNodeSets,
                subpolytope.identicalNodeSets
              ).size === 0
            );
          });
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
    // 最適化: カスタム実装の symmetricDifference を使用
    for (const c of this.children) {
      if (c.identicalNodeSets.size !== subpolytope.identicalNodeSets.size)
        continue;
      if (
        symmetricDifference(c.identicalNodeSets, subpolytope.identicalNodeSets)
          .size === 0
      ) {
        return false;
      }
    }
    return true;
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
    // 最適化: 不必要な配列変換を減らす
    const identicalSets = [...subpolytope.identicalNodeSets];
    const setStrings = new Array(identicalSets.length);

    for (let i = 0; i < identicalSets.length; i++) {
      const nodesArray = [...identicalSets[i]];
      const coordinates = new Array(nodesArray.length);

      for (let j = 0; j < nodesArray.length; j++) {
        coordinates[j] = nodesArray[j].coordinate;
      }

      coordinates.sort();
      setStrings[i] = coordinates.join(",");
    }

    setStrings.sort();
    return `${node.coordinate}-${setStrings.join("|")}`;
  }
}
