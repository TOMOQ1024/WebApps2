import { ExprType } from "./Def";
import { isFunc } from "./Func";
import { BNode, BNodeKind, isBNodeKind } from "./Node";

export type OpStack = (number|BNodeKind|string)[];

export function optypeof(op: OpStack[number]) {
  return isFunc(op) ? `f` : isBNodeKind(op) ? `b` : `v`;
}

export class CStack {
  // opStack: OpStack = [];
  root: (BNode|null) = null;
  eType: ExprType;

  constructor(node: BNode, eType: ExprType){
    // this.opStack = [];
    this.root = node;
    this.eType = eType;
    // this.gen(node);
  }
  
  calc (): number[]{
    return this.root!.calc();
  }

  togl (): string{
    return this.root!.togl();
  }

  tocdgl (): string{
    return this.root!.tocdgl();
  }
}