import { CoxeterDynkinDiagram } from "./CoxeterDynkinDiagram";
import { CoxeterNode } from "./CoxeterNode";

// カスタムSetのsymmetricDifference実装（パフォーマンス向上のため）
function symmetricDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  // 両方のセットのサイズが異なる場合は必ず対称差分は空ではない
  if (setA.size !== setB.size) {
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

  // サイズが同じ場合の最適化
  const result = new Set<T>();
  for (const elem of setA) {
    if (!setB.has(elem)) {
      result.add(elem);
      // 一つでも差分があれば、対称差分は空ではない
      if (result.size > 0) break;
    }
  }

  // 最初の方向で差分がなければ、逆方向もチェック
  if (result.size === 0) {
    for (const elem of setB) {
      if (!setA.has(elem)) {
        result.add(elem);
        break; // 一つ見つかれば十分
      }
    }
  }

  return result;
}

// 高速なセット比較関数（symmetricDifferenceが0かどうかだけを判定）
function isSymmetricDifferenceEmpty<T>(setA: Set<T>, setB: Set<T>): boolean {
  // サイズが異なれば必ず差分あり
  if (setA.size !== setB.size) return false;

  // サイズが同じ場合、片方向の包含関係をチェックするだけで十分
  for (const elem of setA) {
    if (!setB.has(elem)) return false;
  }

  return true;
}

// isVolumelessの結果をキャッシュするためのMap
const isVolumelessCache = new Map<string, boolean>();

// CoxeterDynkinDiagramの拡張
const originalIsVolumeless = CoxeterDynkinDiagram.prototype.isVolumeless;
CoxeterDynkinDiagram.prototype.isVolumeless = function (): boolean {
  // キャッシュキーを生成
  const cacheKey = JSON.stringify({
    nodeMarks: this.nodeMarks,
    gens: this.gens,
  });

  // キャッシュにあればそれを返す
  if (isVolumelessCache.has(cacheKey)) {
    return isVolumelessCache.get(cacheKey)!;
  }

  // なければ計算してキャッシュ
  const result = originalIsVolumeless.call(this);
  isVolumelessCache.set(cacheKey, result);
  return result;
};

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
  // 重複計算を避けるためのキャッシュ
  private processedSubpolytopes = new Map<string, boolean>();
  private cachedIdenticalSetsStrings = new WeakMap<Set<CoxeterNode>, string>();

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
    const rmGens = this.diagram.gens.slice(); // 配列コピーを最適化

    // 事前に処理するノードを配列に格納（Set→Arrayの変換でパフォーマンス向上）
    const allNodesArray = Array.from(this.nodes);

    // Set操作の高速化のためにMap化
    const allNodesMap = new Map<string, CoxeterNode>();
    for (const node of allNodesArray) {
      allNodesMap.set(node.coordinate, node);
    }

    for (let genIndex = 0; genIndex < rmGens.length; genIndex++) {
      const rmGen = rmGens[genIndex];

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

      // ビット演算でSet操作を高速化
      // 代わりにMapを使用して高速な検索を実現
      const visitedNodesMap = new Map<string, CoxeterNode>();

      // 各ノードを起点として深さ優先探索
      for (let nodeIndex = 0; nodeIndex < allNodesArray.length; nodeIndex++) {
        const node = allNodesArray[nodeIndex];
        if (visitedNodesMap.has(node.coordinate)) continue;

        const cacheKey = this.getCacheKey(node, diagram);
        let nodesToProcess: CoxeterNode[];

        if (this.nodeCache.has(cacheKey)) {
          const cachedNodes = this.nodeCache.get(cacheKey)!;
          for (const n of cachedNodes) {
            visitedNodesMap.set(n.coordinate, n);
          }
          nodesToProcess = Array.from(cachedNodes);
        } else {
          const stack: CoxeterNode[] = [node];
          const nodesToProcessMap = new Map<string, CoxeterNode>();
          nodesToProcessMap.set(node.coordinate, node);

          // ノードの収集フェーズ - パフォーマンス改善
          while (stack.length > 0) {
            const currentNode = stack.pop()!;
            visitedNodesMap.set(currentNode.coordinate, currentNode);

            // 隣接ノードの探索 - 効率的なループ
            const diagramGens = diagram.gens;
            for (let i = 0; i < diagramGens.length; i++) {
              const gen = diagramGens[i];
              const nextNode = currentNode.siblings[gen];
              if (
                nextNode &&
                !visitedNodesMap.has(nextNode.coordinate) &&
                !nodesToProcessMap.has(nextNode.coordinate)
              ) {
                stack.push(nextNode);
                nodesToProcessMap.set(nextNode.coordinate, nextNode);
              }
            }
          }

          nodesToProcess = Array.from(nodesToProcessMap.values());
          this.nodeCache.set(cacheKey, new Set(nodesToProcess));
        }

        // 処理を最適化するためSubpolytopeごとのユニークIDを生成
        const subpolytopeId = `${diagramKey}-${node.coordinate}`;
        if (this.processedSubpolytopes.has(subpolytopeId)) {
          continue; // 既に処理済みならスキップ
        }
        this.processedSubpolytopes.set(subpolytopeId, true);

        const subpolytope = new Polytope(diagram, new Set());

        // 一括処理フェーズ - パフォーマンス改善
        const identicalNodeSetsMap = new Map<string, Set<CoxeterNode>>();

        for (const currentNode of nodesToProcess) {
          subpolytope.nodes.add(currentNode);

          // identicalNodeSets操作を効率化
          const identicalNodes = currentNode.identicalNodes;

          // 既存のセットと重複しないようにする
          let setExists = false;
          const setRepKey = this.getSetKey(identicalNodes);

          if (!identicalNodeSetsMap.has(setRepKey)) {
            identicalNodeSetsMap.set(setRepKey, identicalNodes);
            subpolytope.identicalNodeSets.add(identicalNodes);

            // ポリトープの追加を最適化
            for (const n of identicalNodes) {
              n.polytopes.push(subpolytope);
            }
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
          // 高速検索のための最適化
          const candidatePolytopes = node.polytopes.filter(
            (p) =>
              p !== subpolytope &&
              p.visibility &&
              p.identicalNodeSets.size === subpolytope.identicalNodeSets.size
          );

          // 最適化されたセット比較関数を使用
          for (const p of candidatePolytopes) {
            if (
              isSymmetricDifferenceEmpty(
                p.identicalNodeSets,
                subpolytope.identicalNodeSets
              )
            ) {
              alternativeSubpolytope = p;
              break;
            }
          }

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
    // 最適化: カスタム実装の isSymmetricDifferenceEmpty を使用
    const childrenArray = Array.from(this.children);
    for (let i = 0; i < childrenArray.length; i++) {
      const c = childrenArray[i];
      if (c.identicalNodeSets.size !== subpolytope.identicalNodeSets.size)
        continue;
      if (
        isSymmetricDifferenceEmpty(
          c.identicalNodeSets,
          subpolytope.identicalNodeSets
        )
      ) {
        return false;
      }
    }
    return true;
  }

  private updateSiblingRelations() {
    // 配列変換して反復処理を高速化
    const childrenArray = Array.from(this.children);
    for (let i = 0; i < childrenArray.length; i++) {
      const child = childrenArray[i];
      // parentも配列変換
      const parentArray = Array.from(child.parent);
      for (let j = 0; j < parentArray.length; j++) {
        const sibling = parentArray[j];
        if (sibling === this) continue;
        this.addSibling(sibling, child);
      }
    }
  }

  private getCacheKey(
    node: CoxeterNode,
    diagram: CoxeterDynkinDiagram
  ): string {
    return `${node.coordinate}-${diagram.gens.join(",")}`;
  }

  // 集合を文字列化する効率的な方法
  private getSetKey(set: Set<CoxeterNode>): string {
    // キャッシュがあればそれを使用
    if (this.cachedIdenticalSetsStrings.has(set)) {
      return this.cachedIdenticalSetsStrings.get(set)!;
    }

    // なければ計算してキャッシュ
    const coords: string[] = [];
    for (const node of set) {
      coords.push(node.coordinate);
    }
    coords.sort();
    const key = coords.join(",");
    this.cachedIdenticalSetsStrings.set(set, key);
    return key;
  }

  private getAlternativeCacheKey(
    node: CoxeterNode,
    subpolytope: Polytope
  ): string {
    // 最適化: サブポリトープの識別子を効率的に生成
    const identicalSetsKeys: string[] = [];

    // 各セットの文字列表現を生成
    for (const nodeSet of subpolytope.identicalNodeSets) {
      identicalSetsKeys.push(this.getSetKey(nodeSet));
    }

    // ソートして結合
    identicalSetsKeys.sort();
    return `${node.coordinate}-${identicalSetsKeys.join("|")}`;
  }
}
