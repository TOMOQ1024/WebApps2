import sleep from "../Sleep";

export class CoxeterNode {
  siblings: { [gen: string]: CoxeterNode | null } = {};

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
    let nodesToSearch: (CoxeterNode | null)[] = [this];
    let count = 0;
    while (!this.isSolved()) {
      // console.log(graph);
      for (const gen in this.siblings) {
        nodesToSearch.push(nodesToSearch[0]!.addSiblingIfNotExist(gen));
      }
      nodesToSearch.shift();
      nodesToSearch = nodesToSearch.filter((v) => v);
      if (count++ % 1000 === 0) {
        console.log(nodesToSearch.length);
        await sleep(0);
      }
    }
    return this;
  }

  root() {
    return this.getNodeAt(this.coordinate.split("").reverse().join(""))!;
  }

  nodes(searchedNodes: string[] = [""]) {
    if (!searchedNodes.length) this.isSolved(undefined, searchedNodes);
    return searchedNodes.map((p) => this.getNodeAt(p)!);
  }

  clone() {
    const searchedNodes = [""];
    if (!this.isSolved(undefined, searchedNodes)) return null;

    const nodes: CoxeterNode[] = [];
    const root = this.root();
    for (let i = 0; i < searchedNodes.length; i++) {
      nodes.push(new CoxeterNode(this.labels, searchedNodes[i]));
    }
    for (let i = 0; i < searchedNodes.length; i++) {
      const t = root.getNodeAt(searchedNodes[i])!;
      const n = nodes[i];
      for (const gen in this.siblings) {
        n.siblings[gen] =
          nodes[searchedNodes.indexOf(t.getNodeAt(gen)!.coordinate)];
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
    const polygons: string[] = [];
    for (const genPair in this.labels) {
      const polygon = this.popPolygon(genPair, ni);
      if (polygon.length) polygons.push(...polygon);
    }
    return polygons;
  }

  popPolygon(genPair: string, ni: { [gen: string]: string }) {
    const polygon: string[] = [];
    let n: CoxeterNode = this,
      m: CoxeterNode;
    for (let i = 0; i < this.labels[genPair] * 2 + 10; i++) {
      m = n;
      const s: { [gen: string]: number } = {};
      let f = 0;
      for (const gen in this.siblings) {
        s[gen] =
          ni[gen] === "s"
            ? (n.coordinate.match(new RegExp(gen, "g")) ?? []).length
            : 0;
        f += s[gen];
      }
      f %= 2;
      if (n.coordinate.length % 2) {
        if (!n.siblings[genPair[0]]) return polygon;
        n = n.siblings[genPair[0]]!;
        if (!polygon.length && f) continue;
        m.siblings[genPair[0]] = null;
        if (f) continue;
        if (polygon[polygon.length - 1] !== n.coordinate)
          polygon.push(n.coordinate);
      } else {
        if (!n.siblings[genPair[1]]) return polygon;
        n = n.siblings[genPair[1]]!;
        if (!polygon.length && f) continue;
        m.siblings[genPair[1]] = null;
        if (f) continue;
        if (polygon[polygon.length - 1] !== n.coordinate)
          polygon.push(n.coordinate);
      }
    }
    return polygon;
  }

  isSolved(maxDepth: number = 5000, searchedNodes: string[] = [""]) {
    // console.log(`current at: ${this.coordinate}`);
    if (maxDepth === 0) {
      return true;
    }
    if (
      Object.keys(this.siblings)
        .map((gen) => this.siblings[gen])
        .filter((n) => !n).length
    )
      return false;
    for (const gen in this.siblings) {
      const sibCoord = this.siblings[gen]!.coordinate;
      if (searchedNodes.indexOf(sibCoord) < 0) {
        searchedNodes.push(sibCoord);
        if (!this.siblings[gen]!.isSolved(maxDepth - 1, searchedNodes))
          return false;
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
