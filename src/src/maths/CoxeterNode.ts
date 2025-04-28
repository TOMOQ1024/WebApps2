import { getCombinations } from "./CombinationUtils";
import { Polytope } from "./Polytope";

export class CoxeterDynkinDiagram {
  gens: string[] = [];
  constructor(
    public labels: { [genPair: string]: [number, number] } = {},
    public nodeMarks: { [gen: string]: string } = {}
  ) {
    this.gens = Object.keys(nodeMarks);
  }

  withGens(gens: string[]) {
    const newNodeMarks: { [gen: string]: string } = {};
    const newLabels: { [genPair: string]: [number, number] } = {};

    // 指定されたノードのマークだけを含める
    for (const node of gens) {
      if (this.nodeMarks[node]) {
        newNodeMarks[node] = this.nodeMarks[node];
      }
    }

    // 指定されたノード間の辺のラベルだけを含める
    for (const genPair in this.labels) {
      if (gens.includes(genPair[0]) && gens.includes(genPair[1])) {
        newLabels[genPair] = this.labels[genPair];
      }
    }

    return new CoxeterDynkinDiagram(newLabels, newNodeMarks);
  }

  withoutGens(gens: string[]) {
    const newNodeMarks = { ...this.nodeMarks };
    const newLabels = { ...this.labels };

    for (const node of gens) {
      delete newNodeMarks[node];
    }

    for (const genPair in newLabels) {
      if (gens.some((node) => genPair.includes(node))) {
        delete newLabels[genPair];
      }
    }

    return new CoxeterDynkinDiagram(newLabels, newNodeMarks);
  }

  isVolumeless() {
    // ノードの集合を取得
    const nodes = Object.keys(this.nodeMarks);
    if (nodes.length === 0) return true;

    // 連結成分を格納する配列
    const components: string[][] = [];
    // 訪問済みノードを記録するSet
    const visited = new Set<string>();

    // 深さ優先探索で連結成分を見つける関数
    const dfs = (node: string, component: string[]) => {
      visited.add(node);
      component.push(node);

      for (const neighbor of nodes) {
        if (visited.has(neighbor)) continue;

        // 2つのノード間のラベルを取得
        const label = this.labels[node + neighbor];
        // ラベルが存在し、2でない場合のみ連結と見做す
        if (label[0] / label[1] !== 2) {
          dfs(neighbor, component);
        }
      }
    };

    // すべてのノードについて連結成分を見つける
    for (const node of nodes) {
      if (!visited.has(node)) {
        const component: string[] = [];
        dfs(node, component);
        components.push(component);
      }
    }

    // 各連結成分に"x"マークのノードが存在するかチェック
    for (const component of components) {
      let hasX = false;
      for (const node of component) {
        if (this.nodeMarks[node] === "x") {
          hasX = true;
          break;
        }
      }
      // 1つでも"x"マークのないコンポーネントがあればtrueを返す
      if (!hasX) return true;
    }

    // すべての連結成分に"x"マークのノードが存在する場合はfalseを返す
    return false;
  }

  getDimension() {
    // ノードの集合を取得
    const nodes = Object.keys(this.nodeMarks);
    if (nodes.length === 0) return 0;

    // 連結成分を格納する配列
    const components: string[][] = [];
    // 訪問済みノードを記録するSet
    const visited = new Set<string>();

    // 深さ優先探索で連結成分を見つける関数
    const dfs = (node: string, component: string[]) => {
      visited.add(node);
      component.push(node);

      for (const neighbor of nodes) {
        if (visited.has(neighbor)) continue;

        // 2つのノード間のラベルを取得
        const label = this.labels[node + neighbor];
        // ラベルが存在し、2でない場合のみ連結と見做す
        if (label[0] / label[1] !== 2) {
          dfs(neighbor, component);
        }
      }
    };

    // すべてのノードについて連結成分を見つける
    for (const node of nodes) {
      if (!visited.has(node)) {
        const component: string[] = [];
        dfs(node, component);
        components.push(component);
      }
    }

    // "x"マークのノードが存在しない連結成分の個数をカウントする
    let count = 0;
    for (const component of components) {
      let hasX = false;
      for (const node of component) {
        if (this.nodeMarks[node] === "x") {
          hasX = true;
          break;
        }
      }
      if (!hasX) count++;
    }

    return this.gens.length - count;
  }
}

export class CoxeterNode {
  siblings: { [gen: string]: CoxeterNode | null } = {};
  polytopes: Polytope[] = [];
  identicalNode: CoxeterNode = this;

  readonly MAX_NODES = 10000;

  constructor(
    public diagram: CoxeterDynkinDiagram,
    public coordinate: string = "",
    public root: CoxeterNode = this
  ) {
    for (const genPair in this.diagram.labels) {
      for (let i = 0; i < genPair.length; i++) {
        this.siblings[genPair[i]] = null;
      }
    }
    for (const genPair in this.diagram.labels) {
      this.diagram.labels[genPair.split("").reverse().join("")] =
        this.diagram.labels[genPair];
    }
  }

  build() {
    let nodesToSearch: CoxeterNode[] = [this];
    let n: CoxeterNode | null;
    let node: CoxeterNode;
    while (nodesToSearch.length > 0) {
      node = nodesToSearch.shift()!;
      for (const gen in this.siblings) {
        n = node.addSiblingIfNotExist(gen);
        if (n) nodesToSearch.push(n);
      }
      if (nodesToSearch.length > this.MAX_NODES) {
        throw new Error("Too many nodes to search");
      }
    }
    return this;
  }

  nodes(gens: string[] = Object.keys(this.siblings)) {
    const searchedNodes: { [coordinate: string]: CoxeterNode } = {};
    const nodesToSearch: CoxeterNode[] = [this];

    while (nodesToSearch.length > 0) {
      const currentNode = nodesToSearch.shift()!;

      for (const gen of gens) {
        const sibling = currentNode.siblings[gen];
        if (sibling && !searchedNodes[sibling.coordinate]) {
          searchedNodes[sibling.coordinate] = sibling;
          nodesToSearch.push(sibling);
        }
      }
    }

    return searchedNodes;
  }

  clone() {
    const searchedNodes = new Set([""]);
    if (!this.isSolved(undefined, searchedNodes)) return null;

    const nodes: CoxeterNode[] = [];
    const root = this.root;
    for (const sn in searchedNodes) {
      nodes.push(new CoxeterNode(this.diagram, sn));
    }
    for (const sn in searchedNodes) {
      const t = root.getNodeAt(sn)!;
      const n = nodes.find((v) => v.coordinate === sn)!;
      for (const gen in this.siblings) {
        n.siblings[gen] = nodes.find(
          (v) => v.coordinate === t.getNodeAt(gen)!.coordinate
        )!;
      }
      nodes.push(n);
    }
    return nodes[0];
  }

  getNodeAt(path: string) {
    let n: CoxeterNode | null = this;
    for (let i = 0; i < path.length && n; i++) {
      let flag = false;
      for (const gen in this.siblings) {
        if (path[i] === gen) {
          n = n!.siblings[gen];
          flag = true;
        }
      }
      if (!flag) return null;
    }
    return n;
  }

  addSiblingIfNotExist(gen: string) {
    if (this.siblings[gen]) return null;
    let t: CoxeterNode | null;
    for (const gen2 in this.siblings) {
      if (gen2 === gen) continue;
      if (
        (t = this.getNodeAt(
          `${gen2}${gen}`
            .repeat(this.diagram.labels[`${gen2}${gen}`][0])
            .slice(0, -1)
        ))
      ) {
        this.siblings[gen] = t;
        t.siblings[gen] = this;
        if (this.diagram.nodeMarks[gen] === "o") {
          t.identicalNode = this.identicalNode;
        }
        return null;
      }
    }
    const n = new CoxeterNode(
      this.diagram,
      `${this.coordinate}${gen}`,
      this.root
    );
    if (this.diagram.nodeMarks[gen] === "o") {
      n.identicalNode = this.identicalNode;
    }
    this.siblings[gen] = n;
    n.siblings[gen] = this;
    return n;
  }

  buildPolytope() {
    const polytope = new Polytope(this.diagram);
    polytope.nodes = new Set(Object.values(this.nodes()));
    console.log(polytope.nodes.size);
    for (const node of polytope.nodes) {
      node.polytopes.push(polytope);
    }
    polytope.build();
    return polytope;
  }

  // 低次元構成要素配列の生成
  getSubpolytopes(d: number) {
    const subpolytopes: { [genCombination: string]: CoxeterNode[][] } = {};
    const nodes = this.nodes();
    const genCombinations = getCombinations(Object.keys(this.siblings), d);
    const visitedNodes = new Set<string>();

    // 生成元の組み合わせごとに処理
    for (const genCombination of genCombinations) {
      const key = genCombination.join("");
      subpolytopes[key] = [];
      visitedNodes.clear();

      // 各ノードを起点として深さ優先探索
      for (const node of Object.values(nodes)) {
        if (visitedNodes.has(node.coordinate)) continue;

        const subpolytope: CoxeterNode[] = [];
        const stack: CoxeterNode[] = [node];

        while (stack.length > 0) {
          const currentNode = stack.pop()!;
          if (visitedNodes.has(currentNode.coordinate)) continue;

          visitedNodes.add(currentNode.coordinate);
          subpolytope.push(currentNode.identicalNode);

          // 生成元の組み合わせに基づいて隣接ノードを探索
          for (const gen of genCombination) {
            const nextNode = currentNode.siblings[gen];
            if (nextNode && !visitedNodes.has(nextNode.coordinate)) {
              stack.push(nextNode);
            }
          }
        }

        let writeIndex = 0;
        for (let j = 0; j < subpolytope.length; j++) {
          if (subpolytope[j] !== subpolytope[(j + 1) % subpolytope.length]) {
            subpolytope[writeIndex++] = subpolytope[j];
          }
        }
        subpolytope.length = writeIndex;

        if (subpolytope.length > d) {
          subpolytopes[key].push(subpolytope);
        }
      }
    }

    return subpolytopes;
  }

  isSolved(maxDepth: number = 100000, visitedNodes = new Set<string>([""])) {
    let stack: { node: CoxeterNode; depth: number }[] = [
      { node: this, depth: maxDepth },
    ];

    while (stack.length > 0) {
      const { node, depth } = stack.pop()!;
      if (depth === 0) {
        return true;
      }

      if (Object.keys(node.siblings).some((gen) => !node.siblings[gen])) {
        return false;
      }

      for (const gen in node.siblings) {
        const sib = node.siblings[gen]!;
        if (!visitedNodes.has(sib.coordinate)) {
          visitedNodes.add(sib.coordinate);
          stack.push({ node: sib, depth: depth - 1 });
        }
      }
    }

    return true;
  }
}
