import { CoxeterNode } from "./CoxeterNode";

export class Polytope {
  gens: string = "";
  parent: Polytope | null = null;
  siblings: { [gens: string]: Polytope } = {};
  children: { [gens: string]: Polytope } = {};

  // CoxeterNodeから多面体構造を構築する
  static fromCoxeterNode(node: CoxeterNode): Polytope {
    const polytope = new Polytope();
    polytope.gens = Object.keys(node.siblings).join("")
    polytope.parent = null;

    // 子孫多胞体の生成
    return polytope;
  }
}