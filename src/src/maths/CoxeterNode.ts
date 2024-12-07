export class CoxeterNode3 {
  a: CoxeterNode3 | null = null;
  b: CoxeterNode3 | null = null;
  c: CoxeterNode3 | null = null;

  constructor(
    public ma: number,
    public mb: number,
    public mc: number,
    public coordinate: string = ""
  ) {}

  build() {
    let nodesToSearch: (CoxeterNode3 | null)[] = [this];
    while (!this.isSolved()) {
      // console.log(graph);
      nodesToSearch.push(nodesToSearch[0]!.addIfNotExistA());
      nodesToSearch.push(nodesToSearch[0]!.addIfNotExistB());
      nodesToSearch.push(nodesToSearch[0]!.addIfNotExistC());
      nodesToSearch.shift();
      nodesToSearch = nodesToSearch.filter((v) => v);
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

    const nodes: CoxeterNode3[] = [];
    const root = this.root();
    for (let i = 0; i < searchedNodes.length; i++) {
      nodes.push(new CoxeterNode3(this.ma, this.mb, this.mc, searchedNodes[i]));
    }
    for (let i = 0; i < searchedNodes.length; i++) {
      const t = root.getNodeAt(searchedNodes[i])!;
      const n = nodes[i];
      n.a = nodes[searchedNodes.indexOf(t.getNodeAt("a")!.coordinate)];
      n.b = nodes[searchedNodes.indexOf(t.getNodeAt("b")!.coordinate)];
      n.c = nodes[searchedNodes.indexOf(t.getNodeAt("c")!.coordinate)];
      nodes.push(n);
    }
    return nodes[0];
  }

  getNodeAt(path: string) {
    let n: CoxeterNode3 | null = this;
    for (let i = 0; i < path.length && n; i++) {
      if (path[i] === "a") n = n.a;
      else if (path[i] === "b") n = n.b;
      else if (path[i] === "c") n = n.c;
      else return null;
    }
    return n;
  }

  addIfNotExistA() {
    if (this.a) return null;
    let t: CoxeterNode3 | null;
    if ((t = this.getNodeAt("ca".repeat(this.mb).slice(0, -1)))) {
      this.a = t;
      t.a = this;
      return null;
    }
    if ((t = this.getNodeAt("ba".repeat(this.mc).slice(0, -1)))) {
      this.a = t;
      t.a = this;
      return null;
    }
    const n = new CoxeterNode3(
      this.ma,
      this.mb,
      this.mc,
      `${this.coordinate}a`
    );
    this.a = n;
    n.a = this;
    return n;
  }

  addIfNotExistB() {
    if (this.b) return null;
    let t: CoxeterNode3 | null;
    if ((t = this.getNodeAt("ab".repeat(this.mc).slice(0, -1)))) {
      this.b = t;
      t.b = this;
      return null;
    }
    if ((t = this.getNodeAt("cb".repeat(this.ma).slice(0, -1)))) {
      this.b = t;
      t.b = this;
      return null;
    }
    const n = new CoxeterNode3(
      this.ma,
      this.mb,
      this.mc,
      `${this.coordinate}b`
    );
    this.b = n;
    n.b = this;
    return n;
  }

  addIfNotExistC() {
    if (this.c) return null;
    let t: CoxeterNode3 | null;
    if ((t = this.getNodeAt("bc".repeat(this.ma).slice(0, -1)))) {
      this.c = t;
      t.c = this;
      return null;
    }
    if ((t = this.getNodeAt("ac".repeat(this.mb).slice(0, -1)))) {
      this.c = t;
      t.c = this;
      return null;
    }
    const n = new CoxeterNode3(
      this.ma,
      this.mb,
      this.mc,
      `${this.coordinate}c`
    );
    this.c = n;
    n.c = this;
    return n;
  }

  popPolygonA(ni: string) {
    const polygon: string[] = [];
    let n: CoxeterNode3 = this,
      m: CoxeterNode3;
    for (let i = 0; i < this.ma * 2 + 10; i++) {
      m = n;
      const sa = ni[0] === "s" ? (n.coordinate.match(/a/g) ?? []).length : 0;
      const sb = ni[1] === "s" ? (n.coordinate.match(/b/g) ?? []).length : 0;
      const sc = ni[2] === "s" ? (n.coordinate.match(/c/g) ?? []).length : 0;
      const f = (sa + sc + sb) % 2;
      if (n.coordinate.length % 2) {
        if (!n.c) return polygon;
        n = n.c;
        if (!polygon.length && f) continue;
        m.c = null;
        if (f) continue;
        if (polygon[polygon.length - 1] !== n.coordinate)
          polygon.push(n.coordinate);
      } else {
        if (!n.b) return polygon;
        n = n.b;
        if (!polygon.length && f) continue;
        m.b = null;
        if (f) continue;
        if (polygon[polygon.length - 1] !== n.coordinate)
          polygon.push(n.coordinate);
      }
    }
    return polygon;
  }

  popPolygonB(ni: string) {
    const polygon: string[] = [];
    let n: CoxeterNode3 = this,
      m: CoxeterNode3;
    for (let i = 0; i < this.mb * 2 + 10; i++) {
      m = n;
      const sa = ni[0] === "s" ? (n.coordinate.match(/a/g) ?? []).length : 0;
      const sb = ni[1] === "s" ? (n.coordinate.match(/b/g) ?? []).length : 0;
      const sc = ni[2] === "s" ? (n.coordinate.match(/c/g) ?? []).length : 0;
      const f = (sa + sc + sb) % 2;
      if (n.coordinate.length % 2) {
        if (!n.a) return polygon;
        n = n.a;
        if (!polygon.length && f) continue;
        m.a = null;
        if (f) continue;
        if (polygon[polygon.length - 1] !== n.coordinate)
          polygon.push(n.coordinate);
      } else {
        if (!n.c) return polygon;
        n = n.c;
        if (!polygon.length && f) continue;
        m.c = null;
        if (f) continue;
        if (polygon[polygon.length - 1] !== n.coordinate)
          polygon.push(n.coordinate);
      }
    }
    return polygon;
  }

  popPolygonC(ni: string) {
    const polygon: string[] = [];
    let n: CoxeterNode3 = this,
      m: CoxeterNode3;
    for (let i = 0; i < this.mc * 2 + 10; i++) {
      m = n;
      const sa = ni[0] === "s" ? (n.coordinate.match(/a/g) ?? []).length : 0;
      const sb = ni[1] === "s" ? (n.coordinate.match(/b/g) ?? []).length : 0;
      const sc = ni[2] === "s" ? (n.coordinate.match(/c/g) ?? []).length : 0;
      const f = (sa + sc + sb) % 2;
      if (n.coordinate.length % 2) {
        if (!n.b) return polygon;
        n = n.b;
        if (!polygon.length && f) continue;
        m.b = null;
        if (f) continue;
        if (polygon[polygon.length - 1] !== n.coordinate)
          polygon.push(n.coordinate);
      } else {
        if (!n.a) return polygon;
        n = n.a;
        if (!polygon.length && f) continue;
        m.a = null;
        if (f) continue;
        if (polygon[polygon.length - 1] !== n.coordinate)
          polygon.push(n.coordinate);
      }
    }
    return polygon;
  }

  isSolved(maxDepth: number = 1000, searchedNodes: string[] = [""]) {
    // console.log(`current at: ${this.coordinate}`);
    if (maxDepth === 0) {
      return true;
    }
    if (!this.a || !this.b || !this.c) return false;
    const A = this.a.coordinate;
    const B = this.b.coordinate;
    const C = this.c.coordinate;
    if (searchedNodes.findIndex((c) => c === A) < 0) {
      searchedNodes.push(A);
      if (!this.a.isSolved(maxDepth - 1, searchedNodes)) return false;
    }
    if (searchedNodes.findIndex((c) => c === B) < 0) {
      searchedNodes.push(B);
      if (!this.b.isSolved(maxDepth - 1, searchedNodes)) return false;
    }
    if (searchedNodes.findIndex((c) => c === C) < 0) {
      searchedNodes.push(C);
      if (!this.c.isSolved(maxDepth - 1, searchedNodes)) return false;
    }
    return true;
  }

  getIdenticalNodes(ni: string, identicalNodes = [this.coordinate]) {
    if (ni[0] === "o" && identicalNodes.indexOf(this.a!.coordinate) < 0) {
      identicalNodes.push(this.a!.coordinate);
      this.a!.getIdenticalNodes(ni, identicalNodes);
    }
    if (ni[1] === "o" && identicalNodes.indexOf(this.b!.coordinate) < 0) {
      identicalNodes.push(this.b!.coordinate);
      this.b!.getIdenticalNodes(ni, identicalNodes);
    }
    if (ni[2] === "o" && identicalNodes.indexOf(this.c!.coordinate) < 0) {
      identicalNodes.push(this.c!.coordinate);
      this.c!.getIdenticalNodes(ni, identicalNodes);
    }
    return identicalNodes;
  }
}
