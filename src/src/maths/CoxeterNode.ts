import { getCombinations } from "./CombinationUtils";
import { CoxeterDynkinDiagram } from "./CoxeterDynkinDiagram";
import { Polytope } from "./Polytope";

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
