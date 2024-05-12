import { Funcs } from "./Func";
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
    public val: (number|VarName|string) = 0
  ){}

  static zero = new BNode(BNodeKind.NUM, null, null, 0);

  toStr(i:number=0){
    let str = '';
    str += `${''.padStart(i,'| ')}${this.kind} : ${this.val}\n`;
    if(this.lhs !== null) str += `${this.lhs.toStr(i+2)}`;
    if(this.rhs !== null) str += `${this.rhs.toStr(i+2)}`;
    return str;
  }

  calcL (): number[] { return this.lhs ? this.lhs.calc() : []; }
  calcR (): number[] { return this.rhs ? this.rhs.calc() : []; }
  calc (): number[] {
    switch(this.kind){
      case BNodeKind.FNC: {
        const f = Funcs[this.val];
        if (!f) break;
        return f.calc!(this);
      }
      case BNodeKind.NUM: return [this.val as number];
      case BNodeKind.ADD: return [this.calcL()[0] + this.calcR()[0]];
      case BNodeKind.SUB: return [this.calcL()[0] - this.calcR()[0]];
      case BNodeKind.MUL: return [this.calcL()[0] * this.calcR()[0]];
      case BNodeKind.DIV: return [this.calcL()[0] / this.calcR()[0]];
      case BNodeKind.MOD: return [this.calcL()[0] % this.calcR()[0]];
      case BNodeKind.POW: return [this.calcL()[0] ** this.calcR()[0]];
    }

    return [];
  }

  toglL (fn=''): string { return this.lhs ? this.lhs.togl(fn) : ''; }
  toglR (fn=''): string { return this.rhs ? this.rhs.togl(fn) : ''; }
  togl (fn=''): string {
    switch(this.kind){
      case BNodeKind.FNC: {
        const f = Funcs[this.val];
        if (!f) break;
        return f.togl!(this);
      }
      case BNodeKind.VAR:
        switch(this.val){
          // case VarName.X: return `x`;
          // case VarName.Y: return `y`;
          case VarName.PI: return `3.14`;
          case VarName.E: return `2.71`;
        }
        break;
      case BNodeKind.NUM: return `float(${this.val})`;
      case BNodeKind.NID: return `${this.val}`;
      case BNodeKind.DFD: return `${this.val}`;
      case BNodeKind.EQL: return `${this.toglL()}==${this.toglR()}`;
      // case BNodeKind.EQL: return this.eType==='defi'
      //   ? `${this.toglL()}=${this.toglR()}`
      //   : `${this.toglL()}==${this.toglR()}`;
      case BNodeKind.GEQ: return `${this.toglL()}>=${this.toglR()}`;
      case BNodeKind.LEQ: return `${this.toglL()}<=${this.toglR()}`;
      case BNodeKind.GET: return `${this.toglL()}>${this.toglR()}`;
      case BNodeKind.LET: return `${this.toglL()}<${this.toglR()}`;
      case BNodeKind.ADD: return `${this.toglL()}+${this.toglR()}`;
      case BNodeKind.SUB: return `${this.toglL()}-${this.toglR()}`;
      case BNodeKind.MUL: return `${this.toglL()}*${this.toglR()}`;
      case BNodeKind.DIV: return `${this.toglL()}/${this.toglR()}`;
      case BNodeKind.MOD: return `mod(${this.toglL()},${this.toglR()})`;
      case BNodeKind.POW: return `pow(${this.toglL()},${this.toglR()})`;
    }

    return '';
  }

  tocdglL (fn=''): string { return this.lhs ? this.lhs.tocdgl(fn) : ''; }
  tocdglR (fn=''): string { return this.rhs ? this.rhs.tocdgl(fn) : ''; }
  tocdgl(fn=''): string{
    switch(this.kind){
      case BNodeKind.FNC: {
        const f = Funcs[this.val];
        if (!f) break;
        if (!f.tocdgl) {
          throw new Error(`関数 ${f.str} は実装されていません`);
        }
        return f.tocdgl(this, fn);
      }
      case BNodeKind.VAR:
        switch(this.val){
          // case VarName.X: return `x`;
          // case VarName.Y: return `y`;
          case VarName.PI: return `vec2(PI,0.)`;
          case VarName.E: return `vec2(E,0.)`;
        }
        break;
      case BNodeKind.NUM: return this.val===Math.floor(Number(this.val)) ? `vec2(${this.val}.,0.)` : `vec2(${this.val},0.)`;
      case BNodeKind.NID: return `${this.val}`;
      case BNodeKind.DFD: return `${this.val==='i' ? 'vec2(0.,1.)' : this.val}`;
      // case BNodeKind.EQL: return this.eType==='defi'
      //   ? `${this.tocdgl(this.lhs)}=${this.tocdgl(this.rhs)}`
      //   : `${this.tocdgl(this.lhs)}==${this.tocdgl(this.rhs)}`;
      // case BNodeKind.GEQ: return `${this.tocdgl(this.lhs)}>=${this.tocdgl(this.rhs)}`;
      // case BNodeKind.LEQ: return `${this.tocdgl(this.lhs)}<=${this.tocdgl(this.rhs)}`;
      // case BNodeKind.GET: return `${this.tocdgl(this.lhs)}>${this.tocdgl(this.rhs)}`;
      // case BNodeKind.LET: return `${this.tocdgl(this.lhs)}<${this.tocdgl(this.rhs)}`;
      case BNodeKind.ADD: return `${this.tocdglL()}+${this.tocdglR()}`;
      case BNodeKind.SUB: return `${this.tocdglL()}-${this.tocdglR()}`;
      case BNodeKind.MUL: return `cprod(${this.tocdglL()},${this.tocdglR()})`;
      case BNodeKind.DIV: return `cdiv(${this.tocdglL()},${this.tocdglR()})`;
      case BNodeKind.MOD: throw new Error(`mod関数は実装されていません`);
      case BNodeKind.POW: return `cpow(${this.tocdglL()},${this.tocdglR()})`;
    }
    return '';
  }
}
