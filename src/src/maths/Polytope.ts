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
  private alternativeCache: Map<Polytope, Polytope | undefined> = new Map();
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

  build() {
    // 生成元の組み合わせごとに処理
    const rmGens = this.diagram.gens;

    for (const rmGen of rmGens) {
      // ダイアグラムのキャッシュを利用
      const diagramKey = rmGen;
      let diagram = this.diagramCache.get(diagramKey);

      if (!diagram) {
        diagram = this.diagram.withoutGen(rmGen);
        this.diagramCache.set(diagramKey, diagram);
      }

      const isVolumeless = diagram.isVolumeless();
      const visitedNodes = new Set<string>();

      // バッチ処理のためのキュー
      const processingQueue: { node: CoxeterNode; subpolytope: Polytope }[] =
        [];

      for (const node of this.nodes) {
        if (visitedNodes.has(node.coordinate)) continue;

        const cacheKey = this.getCacheKey(node, diagram);
        let nodesToProcess: CoxeterNode[];

        if (this.nodeCache.has(cacheKey)) {
          const cachedNodes = this.nodeCache.get(cacheKey)!;
          for (const n of cachedNodes) {
            visitedNodes.add(n.coordinate);
          }
          nodesToProcess = Array.from(cachedNodes);
        } else {
          nodesToProcess = this.collectConnectedNodes(
            node,
            diagram,
            visitedNodes
          );

          this.nodeCache.set(cacheKey, new Set(nodesToProcess));
        }

        const subpolytopeId = `${diagramKey}-${node.coordinate}`;
        if (this.processedSubpolytopes.has(subpolytopeId)) continue;

        this.processedSubpolytopes.set(subpolytopeId, true);
        const subpolytope = new Polytope(diagram, new Set());

        // ノードの一括処理
        this.batchProcessNodes(nodesToProcess, subpolytope);

        let alternativeSubpolytope = this.alternativeCache.get(subpolytope);

        if (alternativeSubpolytope === undefined) {
          alternativeSubpolytope = this.findAlternativeSubpolytope(subpolytope);

          this.alternativeCache.set(subpolytope, alternativeSubpolytope);
        }

        if (alternativeSubpolytope) {
          subpolytope.visibility = false;
          if (
            alternativeSubpolytope.diagram.gens.length > diagram.gens.length
          ) {
            alternativeSubpolytope.diagram = diagram;
          }
          processingQueue.push({
            node: node,
            subpolytope: alternativeSubpolytope,
          });
        } else {
          processingQueue.push({ node: node, subpolytope: subpolytope });
        }
      }

      // バッチ処理の実行
      for (const { subpolytope } of processingQueue) {
        if (!isVolumeless && this.isUniqueChild(subpolytope)) {
          subpolytope.visibility = true;
          this.children.add(subpolytope);
          subpolytope.parent.add(this);
          if (this.diagram.gens.length > 0) subpolytope.build();
        }
      }
    }

    this.updateSiblingRelations();
  }

  private collectConnectedNodes(
    startNode: CoxeterNode,
    diagram: CoxeterDynkinDiagram,
    visitedNodes: Set<string>
  ): CoxeterNode[] {
    const stack = [startNode];
    const result = new Set<CoxeterNode>([startNode]);
    visitedNodes.add(startNode.coordinate);

    while (stack.length > 0) {
      const currentNode = stack.pop()!;

      for (const gen of diagram.gens) {
        const nextNode = currentNode.siblings[gen];
        if (nextNode && !visitedNodes.has(nextNode.coordinate)) {
          visitedNodes.add(nextNode.coordinate);
          stack.push(nextNode);
          result.add(nextNode);
        }
      }
    }

    return Array.from(result);
  }

  private batchProcessNodes(nodes: CoxeterNode[], subpolytope: Polytope) {
    const processedSets = new Set<string>();

    for (const node of nodes) {
      subpolytope.nodes.add(node);

      const identicalNodes = node.identicalNodes;
      const setKey = this.getSetKey(identicalNodes);

      if (!processedSets.has(setKey)) {
        processedSets.add(setKey);
        subpolytope.identicalNodeSets.add(identicalNodes);

        for (const n of identicalNodes) {
          n.polytopes.push(subpolytope);
        }
      }
    }
  }

  private findAlternativeSubpolytope(
    subpolytope: Polytope
  ): Polytope | undefined {
    const targetSize = subpolytope.identicalNodeSets.size;
    const firstNode = subpolytope.nodes.values().next().value;

    if (!firstNode) return undefined;

    const candidates = firstNode.polytopes.filter(
      (p) =>
        p !== subpolytope &&
        p.visibility &&
        p.identicalNodeSets.size === targetSize
    );

    for (const candidate of candidates) {
      if (
        isSymmetricDifferenceEmpty(
          candidate.identicalNodeSets,
          subpolytope.identicalNodeSets
        )
      ) {
        return candidate;
      }
    }

    return undefined;
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
        this.siblings.set(sibling, child);
        sibling.siblings.set(this, child);
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
}
