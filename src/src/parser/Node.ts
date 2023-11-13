import { FuncName } from "./Func";
import { VarName } from "./Var";

export enum BNodeKind {
  VAR = 'var',
  NID = 'nid',
  DFD = 'dfd',
  EQL = 'eql',
  GEQ = 'geq',
  LEQ = 'leq',
  GET = 'get',
  LET = 'let',
  ADD = 'add',
  SUB = 'sub',
  MUL = 'mul',
  DIV = 'div',
  MOD = 'mod',
  POW = 'pow',
  NUM = 'num',
  FNC = 'fnc',
  UNK = 'unk'
}

export function isBNodeKind(input: any){
  let s = String(input);
  return 0<=Object.values(BNodeKind).map(t=>String(t)).indexOf(s);
}

export class BNode {
  constructor(
    public kind: BNodeKind = BNodeKind.UNK,
    public lhs: (BNode|null) = null,
    public rhs: (BNode|null) = null,
    public val: (number|FuncName|VarName|string) = 0
  ){}

  static zero = new BNode(BNodeKind.NUM, null, null, 0);

  toStr(i:number=0){
    let str = '';
    str += `${''.padStart(i,'| ')}${this.kind} : ${this.val}\n`;
    if(this.lhs !== null) str += `${this.lhs.toStr(i+2)}`;
    if(this.rhs !== null) str += `${this.rhs.toStr(i+2)}`;
    return str;
  }
}
