export interface CoxeterDynkinDiagram {
  labels: { [genPair: string]: [number, number] };
  nodeMarks: { [gen: string]: string };
}

export class CoxeterNode {
  siblings: { [gen: string]: CoxeterNode | null } = {};

  readonly MAX_NODES = 10000;

  constructor(
    public diagram: CoxeterDynkinDiagram,
    public coordinate: string = ""
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
    while (nodesToSearch.length > 0) {
      for (const gen in this.siblings) {
        n = nodesToSearch[0]!.addSiblingIfNotExist(gen);
        if (n) nodesToSearch.push(n);
      }
      nodesToSearch.shift();
      if (nodesToSearch.length > this.MAX_NODES) {
        throw new Error("Too many nodes to search");
      }
    }
    return this;
  }

  root() {
    return this.getNodeAt(this.coordinate.split("").reverse().join(""))!;
  }

  nodes() {
    const searchedNodes: { [coordinate: string]: CoxeterNode } = {};
    const nodesToSearch: CoxeterNode[] = [this];

    while (nodesToSearch.length > 0) {
      const currentNode = nodesToSearch.shift()!;

      for (const gen in currentNode.siblings) {
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
    const root = this.root();
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
        return null;
      }
    }
    const n = new CoxeterNode(this.diagram, `${this.coordinate}${gen}`);
    this.siblings[gen] = n;
    n.siblings[gen] = this;
    return n;
  }

  // 低次元構成要素配列の生成
  getSubpolytopes(d: number) {
    const subpolytopes: { [genCombination: string]: CoxeterNode[][] } = {};
    const nodes = this.nodes();
    const genCombinations = this.getGenCombinations(d);
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
          subpolytope.push(currentNode);

          // 生成元の組み合わせに基づいて隣接ノードを探索
          for (const gen of genCombination) {
            const nextNode = currentNode.siblings[gen];
            if (nextNode && !visitedNodes.has(nextNode.coordinate)) {
              stack.push(nextNode);
            }
          }
        }

        if (subpolytope.length > 0) {
          subpolytopes[key].push(subpolytope);
        }
      }
    }

    return subpolytopes;
  }

  getGenCombinations(d: number) {
    const result: string[][] = [];
    const gens = Object.keys(this.siblings);
    const stack: { path: string[]; start: number }[] = [];

    stack.push({ path: [], start: 0 });

    while (stack.length > 0) {
      const { path, start } = stack.pop()!;

      if (path.length === d) {
        result.push(path);
        continue;
      }

      for (let i = gens.length - 1; i >= start; i--) {
        stack.push({ path: [...path, gens[i]], start: i + 1 });
      }
    }

    return result;
  }

  // popPolygons() {
  //   return Object.keys(this.labels)
  //     .map((genPair) => this.popPolygon(genPair))
  //     .filter((polygon) => polygon.length > 0);
  // }

  // popPolygon(genPair: string) {
  //   const polygon: string[] = [];
  //   let currentNode: CoxeterNode = this;
  //   const maxIterations = this.labels[genPair] * 2 + 10;

  //   // 生成元ごとのsフラグをキャッシュ
  //   const isSnubGen = Object.fromEntries(
  //     Object.keys(this.siblings).map((gen) => [gen, this.nodeMarks[gen] === "s"])
  //   );

  //   for (let i = 0; i < maxIterations; i++) {
  //     let snubFlag = 0;
  //     if (Object.values(isSnubGen).some((flag) => flag)) {
  //       const coord = currentNode.coordinate;
  //       for (const [gen, isSnub] of Object.entries(isSnubGen)) {
  //         if (isSnub) {
  //           snubFlag += (coord.match(new RegExp(gen, "g")) || []).length;
  //         }
  //       }
  //       snubFlag %= 2;
  //     }

  //     const sib = genPair[currentNode.coordinate.length % 2];
  //     if (!currentNode.siblings[sib]) return polygon;

  //     currentNode = currentNode.siblings[sib];

  //     // snubフラグに基づく処理
  //     if (snubFlag && !polygon.length) continue;

  //     // 重複チェックと追加
  //     if (!polygon.includes(currentNode.coordinate)) {
  //       polygon.push(currentNode.coordinate);
  //     }
  //   }

  //   return polygon;
  // }

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

  getIdenticalNodes(identicalNodes = [this.coordinate]) {
    for (const gen in this.siblings) {
      if (
        this.diagram.nodeMarks[gen] === "o" &&
        identicalNodes.indexOf(this.siblings[gen]!.coordinate) < 0
      ) {
        identicalNodes.push(this.siblings[gen]!.coordinate);
        this.siblings[gen]!.getIdenticalNodes(identicalNodes);
      }
    }
    return identicalNodes;
  }
}
