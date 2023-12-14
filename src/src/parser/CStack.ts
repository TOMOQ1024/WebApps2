import { ExprType } from "./Def";
import { FuncName, isFuncName } from "./Func";
import { BNode, BNodeKind, isBNodeKind } from "./Node";
import { VarName } from "./Var";

export type OpStack = (number|FuncName|BNodeKind)[];

export function optypeof(op: OpStack[number]) {
  return isFuncName(op) ? `f` : isBNodeKind(op) ? `b` : `v`;
}

function median(...args:number[]){
  args.sort();
  if(args.length%2){
    return args[(args.length-1)/2];
  } else {
    return (args[args.length/2-1]+args[args.length/2])/2;
  }
}

function average(...args:number[]){
  return args.reduce((a,b)=>a+b) / args.length;
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

  calc_(){
    return this.calc(this.root);
  }

  calc(node: (BNode|null)): number[]{
    if(node === null)return [];

    switch(node.kind){
      case BNodeKind.FNC:
        switch(node.val){
          case FuncName.NIL: return [...this.calc(node.lhs),...this.calc(node.rhs)].filter(v=>v!==null);
          case FuncName.COS: return [Math.cos(this.calc(node.lhs)[0])];
          case FuncName.SIN: return [Math.sin(this.calc(node.lhs)[0])];
          case FuncName.TAN: return [Math.tan(this.calc(node.lhs)[0])];
          case FuncName.FLR: return [Math.floor(this.calc(node.lhs)[0])];
          case FuncName.RND: return [Math.round(this.calc(node.lhs)[0])];
          case FuncName.CIL: return [Math.ceil(this.calc(node.lhs)[0])];
          case FuncName.ABS: return [Math.abs(this.calc(node.lhs)[0])];
          case FuncName.SQR: return [Math.sqrt(this.calc(node.lhs)[0])];
          case FuncName.CBR: return [Math.cbrt(this.calc(node.lhs)[0])];
          case FuncName.MAX: return [Math.max(...this.calc(node.lhs),...this.calc(node.rhs))];
          case FuncName.MIN: return [Math.min(...this.calc(node.lhs),...this.calc(node.rhs))];
          case FuncName.MED: return [median(...this.calc(node.lhs),...this.calc(node.rhs))];
          case FuncName.AVG: return [average(...this.calc(node.lhs),...this.calc(node.rhs))];
        }
        break;
      case BNodeKind.NUM: return [node.val as number];
      case BNodeKind.ADD: return [this.calc(node.lhs!)[0] + this.calc(node.rhs!)[0]];
      case BNodeKind.SUB: return [this.calc(node.lhs!)[0] - this.calc(node.rhs!)[0]];
      case BNodeKind.MUL: return [this.calc(node.lhs!)[0] * this.calc(node.rhs!)[0]];
      case BNodeKind.DIV: return [this.calc(node.lhs!)[0] / this.calc(node.rhs!)[0]];
      case BNodeKind.MOD: return [this.calc(node.lhs!)[0] % this.calc(node.rhs!)[0]];
      case BNodeKind.POW: return [this.calc(node.lhs!)[0] ** this.calc(node.rhs!)[0]];
    }

    return [];
  }

  togl(node: (BNode|null)): string{
    if(node === null) return '';

    switch(node.kind){
      case BNodeKind.FNC:
        switch(node.val){
          case FuncName.NIL: return `${this.togl(node.lhs)},${this.togl(node.rhs)}`;
          case FuncName.COS: return `cos(${this.togl(node.lhs)})`;
          case FuncName.SIN: return `sin(${this.togl(node.lhs)})`;
          case FuncName.TAN: return `tan(${this.togl(node.lhs)})`;
          case FuncName.FLR: return `floor(${this.togl(node.lhs)})`;
          case FuncName.RND: return `round(${this.togl(node.lhs)})`;
          case FuncName.CIL: return `ceil(${this.togl(node.lhs)})`;
          case FuncName.ABS: return `abs(${this.togl(node.lhs)})`;
          case FuncName.SQR: return `sqrt(${this.togl(node.lhs)})`;
          case FuncName.CBR: return `cbrt(${this.togl(node.lhs)})`;
          case FuncName.MAX: return `max(${this.togl(node.lhs)},${this.togl(node.rhs)})`;
          case FuncName.MIN: return `min(${this.togl(node.lhs)},${this.togl(node.rhs)})`;
          case FuncName.MED: return `median(${this.togl(node.lhs)},${this.togl(node.rhs)})`;
          case FuncName.AVG: return `average(${this.togl(node.lhs)},${this.togl(node.rhs)})`;
        }
        break;
      case BNodeKind.VAR:
        switch(node.val){
          case VarName.X: return `x`;
          case VarName.Y: return `y`;
          case VarName.PI: return `3.14`;
          case VarName.E: return `2.71`;
        }
        break;
      case BNodeKind.NUM: return `float(${node.val})`;
      case BNodeKind.NID: return `${node.val}`;
      case BNodeKind.DFD: return `${node.val}`;
      case BNodeKind.EQL: return this.eType==='defi'
        ? `${this.togl(node.lhs)}=${this.togl(node.rhs)}`
        : `${this.togl(node.lhs)}==${this.togl(node.rhs)}`;
      case BNodeKind.GEQ: return `${this.togl(node.lhs)}>=${this.togl(node.rhs)}`;
      case BNodeKind.LEQ: return `${this.togl(node.lhs)}<=${this.togl(node.rhs)}`;
      case BNodeKind.GET: return `${this.togl(node.lhs)}>${this.togl(node.rhs)}`;
      case BNodeKind.LET: return `${this.togl(node.lhs)}<${this.togl(node.rhs)}`;
      case BNodeKind.ADD: return `${this.togl(node.lhs)}+${this.togl(node.rhs)}`;
      case BNodeKind.SUB: return `${this.togl(node.lhs)}-${this.togl(node.rhs)}`;
      case BNodeKind.MUL: return `${this.togl(node.lhs)}*${this.togl(node.rhs)}`;
      case BNodeKind.DIV: return `${this.togl(node.lhs)}/${this.togl(node.rhs)}`;
      case BNodeKind.MOD: return `mod(${this.togl(node.lhs)},${this.togl(node.rhs)})`;
      case BNodeKind.POW: return `pow(${this.togl(node.lhs)},${this.togl(node.rhs)})`;
    }

    return '';
  }

  tocdgl(node: (BNode|null)): string{
    if(node === null) return '';

    switch(node.kind){
      case BNodeKind.FNC:
        switch(node.val){
          case FuncName.NIL: return `${this.tocdgl(node.lhs)},${this.tocdgl(node.rhs)}`;
          case FuncName.COH: return `ccosh(${this.tocdgl(node.lhs)})`;
          case FuncName.SIH: return `csinh(${this.tocdgl(node.lhs)})`;
          case FuncName.COS: return `ccos(${this.tocdgl(node.lhs)})`;
          case FuncName.SIN: return `csin(${this.tocdgl(node.lhs)})`;
          case FuncName.TAN: return `ctan(${this.tocdgl(node.lhs)})`;
          case FuncName.FLR: return `cfloor(${this.tocdgl(node.lhs)})`;
          case FuncName.RND: return `cround(${this.tocdgl(node.lhs)})`;
          case FuncName.CIL: return `cceil(${this.tocdgl(node.lhs)})`;
          case FuncName.ABS: return `cabs(${this.tocdgl(node.lhs)})`;
          case FuncName.SQR: return `csqrt(${this.tocdgl(node.lhs)})`;
          case FuncName.CBR: return `ccbrt(${this.tocdgl(node.lhs)})`;
          case FuncName.EXP: return `cexp(${this.tocdgl(node.lhs)})`;
          case FuncName.MAX: return `cmax(${this.tocdgl(node.lhs)},${this.tocdgl(node.rhs)})`;
          case FuncName.MIN: return `cmin(${this.tocdgl(node.lhs)},${this.tocdgl(node.rhs)})`;
          case FuncName.MED: return `cmedian(${this.tocdgl(node.lhs)},${this.tocdgl(node.rhs)})`;
          case FuncName.AVG: return `caverage(${this.tocdgl(node.lhs)},${this.tocdgl(node.rhs)})`;
        }
        break;
      case BNodeKind.VAR:
        switch(node.val){
          case VarName.X: return `x`;
          case VarName.Y: return `y`;
          case VarName.PI: return `vec2(PI,0.)`;
          case VarName.E: return `vec2(E,0.)`;
        }
        break;
      case BNodeKind.NUM: return node.val===Math.floor(Number(node.val)) ? `vec2(${node.val}.,0.)` : `vec2(${node.val},0.)`;
      case BNodeKind.NID: return `${node.val}`;
      case BNodeKind.DFD: return `${node.val==='i' ? 'vec2(0.,1.)' : node.val}`;
      // case BNodeKind.EQL: return this.eType==='defi'
      //   ? `${this.tocdgl(node.lhs)}=${this.tocdgl(node.rhs)}`
      //   : `${this.tocdgl(node.lhs)}==${this.tocdgl(node.rhs)}`;
      // case BNodeKind.GEQ: return `${this.tocdgl(node.lhs)}>=${this.tocdgl(node.rhs)}`;
      // case BNodeKind.LEQ: return `${this.tocdgl(node.lhs)}<=${this.tocdgl(node.rhs)}`;
      // case BNodeKind.GET: return `${this.tocdgl(node.lhs)}>${this.tocdgl(node.rhs)}`;
      // case BNodeKind.LET: return `${this.tocdgl(node.lhs)}<${this.tocdgl(node.rhs)}`;
      case BNodeKind.ADD: return `${this.tocdgl(node.lhs)}+${this.tocdgl(node.rhs)}`;
      case BNodeKind.SUB: return `${this.tocdgl(node.lhs)}-${this.tocdgl(node.rhs)}`;
      case BNodeKind.MUL: return `cprod(${this.tocdgl(node.lhs)},${this.tocdgl(node.rhs)})`;
      case BNodeKind.DIV: return `cdiv(${this.tocdgl(node.lhs)},${this.tocdgl(node.rhs)})`;
      case BNodeKind.MOD: return `cmod(${this.tocdgl(node.lhs)},${this.tocdgl(node.rhs)})`;
      case BNodeKind.POW: return `cpow(${this.tocdgl(node.lhs)},${this.tocdgl(node.rhs)})`;
    }

    return '';
  }
}