import sleep from "../Sleep";

export class CoxeterNode {
  siblings: { [gen: string]: CoxeterNode | null } = {};

  readonly MAX_NODES = 10000;

  constructor(
    public labels: { [genPair: string]: number },
    public coordinate: string = ""
  ) {
    for (const genPair in labels) {
      for (let i = 0; i < genPair.length; i++) {
        this.siblings[genPair[i]] = null;
      }
    }
    for (const genPair in labels) {
      labels[genPair.split("").reverse().join("")] = labels[genPair];
    }
  }

  async build() {
    let nodesToSearch: CoxeterNode[] = [this];
    let count = 0;
    let n: CoxeterNode | null;
    while (nodesToSearch.length > 0) {
      for (const gen in this.siblings) {
        n = nodesToSearch[0]!.addSiblingIfNotExist(gen);
        if (n) nodesToSearch.push(n);
      }
      nodesToSearch.shift();
      if (count++ % 1000 === 0) {
        console.log(`Nodes to search: ${nodesToSearch.length} nodes`);
        await sleep(0);
      }
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
      nodes.push(new CoxeterNode(this.labels, sn));
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
          `${gen2}${gen}`.repeat(this.labels[`${gen2}${gen}`]).slice(0, -1)
        ))
      ) {
        this.siblings[gen] = t;
        t.siblings[gen] = this;
        return null;
      }
    }
    const n = new CoxeterNode(this.labels, `${this.coordinate}${gen}`);
    this.siblings[gen] = n;
    n.siblings[gen] = this;
    return n;
  }

  popPolygons(ni: { [gen: string]: string }) {
    return Object.keys(this.labels)
      .map((genPair) => this.popPolygon(genPair, ni))
      .filter((polygon) => polygon.length > 0);
  }

  popPolygon(genPair: string, ni: { [gen: string]: string }) {
    const polygon: string[] = [];
    let currentNode: CoxeterNode = this;
    const maxIterations = this.labels[genPair] * 2 + 10;

    // 生成元ごとのsフラグをキャッシュ
    const isSnubGen = Object.fromEntries(
      Object.keys(this.siblings).map((gen) => [gen, ni[gen] === "s"])
    );

    for (let i = 0; i < maxIterations; i++) {
      let snubFlag = 0;
      if (Object.values(isSnubGen).some((flag) => flag)) {
        const coord = currentNode.coordinate;
        for (const [gen, isSnub] of Object.entries(isSnubGen)) {
          if (isSnub) {
            snubFlag += (coord.match(new RegExp(gen, "g")) || []).length;
          }
        }
        snubFlag %= 2;
      }

      const sib = genPair[currentNode.coordinate.length % 2];
      if (!currentNode.siblings[sib]) return polygon;

      currentNode = currentNode.siblings[sib];

      // snubフラグに基づく処理
      if (snubFlag && (!polygon.length || true)) continue;

      // 重複チェックと追加
      if (!polygon.includes(currentNode.coordinate)) {
        polygon.push(currentNode.coordinate);
      }
    }

    return polygon;
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

  getIdenticalNodes(
    ni: { [gen: string]: string },
    identicalNodes = [this.coordinate]
  ) {
    for (const gen in this.siblings) {
      if (
        ni[gen] === "o" &&
        identicalNodes.indexOf(this.siblings[gen]!.coordinate) < 0
      ) {
        identicalNodes.push(this.siblings[gen]!.coordinate);
        this.siblings[gen]!.getIdenticalNodes(ni, identicalNodes);
      }
    }
    return identicalNodes;
  }
}
