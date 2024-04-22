import Core from "./Core";
import { COLORS, OPERATIONS, Operations, isIn } from "./Definitions";

export default class ProgramPointer {
  current = 0;
  get currentX () { return this.current % this.parent.size.x; }
  get currentY () { return Math.floor(this.current / this.parent.size.x); }
  next = -1;
  get nextX () { return this.next % this.parent.size.x; }
  get nextY () { return Math.floor(this.next / this.parent.size.x); }
  dp = 0;
  cc = 0;
  block: number[] = [];
  stuckCount = 0;

  constructor (public parent: Core) {
    //
  }

  reset () {
    this.current = 0;
    this.next = -1;
    this.dp = 0;
    this.cc = 0;
    this.parent.stack.clear();
    // this.parent.input!!!
  }

  run () {
    //
  }

  step () {
    if (this.next === -1) {
      // 開始
      this.updateNext();
    }
    else if (this.next === -2) {
      return true;
    }
    
    this.updateStack();
    this.current = this.next;
    this.updateNext();
    return true;
  }

  updateStack () : number{
    const d = (this.parent.code[this.next]-this.parent.code[this.current]+18)%18;

    const dx = d%3;
    const dy = Math.floor(d/3);
    const s = this.parent.stack;
    switch (d) {
      case OPERATIONS.NOP: break;
      case OPERATIONS.PSH: s.psh(this.block.length); break;
      case OPERATIONS.POP: s.pop(); break;
      case OPERATIONS.ADD: s.add(); break;
      case OPERATIONS.SUB: s.sub(); break;
      case OPERATIONS.DIV: s.div(); break;
      case OPERATIONS.DUP: s.dup(); break;
      case OPERATIONS.GRT: s.grt(); break;
      case OPERATIONS.INC: s.inc(); break;
      case OPERATIONS.INN: s.inn(); break;
      case OPERATIONS.MOD: s.mod(); break;
      case OPERATIONS.MUL: s.mul(); break;
      case OPERATIONS.NOT: s.not(); break;
      case OPERATIONS.OTC: s.otc(); break;
      case OPERATIONS.OTN: s.otn(); break;
      case OPERATIONS.PNT: s.pnt(); break;
      case OPERATIONS.ROL: s.rol(); break;
      case OPERATIONS.SWT: s.swt(); break;
    }
    console.log(this.parent.stack.stack);
    // push state!!!
    return 0;
  }

  updateNext () {
    const W = this.parent.size.x;
    const H = this.parent.size.y;
    this.block = this.parent.getBlock(this.currentX,this.currentY);
    let stuck = 0;
    const D = [1,W,-1,-W];
    let d: number;
    while (stuck < 8) {
      d = D[this.dp%4];
      const ec = this.current = this.getEdgeCodel();
      if (isIn(ec%W + d%W, Math.floor(ec/W) + Math.floor(d/W), W, H) && this.parent.code[ec + d] !== COLORS.K) {
        this.next = ec+d;
        return true;
      }
      else {
        if (stuck % 2 === 0) ++this.cc;
        else ++this.dp;
        ++stuck;
      }
    }
  }

  getEdgeCodel () {
    const W = this.parent.size.x;
    const H = this.parent.size.y;
    let edge: number[] = [];
    let bound: number;
    // console.log(`dp:${e.dp}, cc:${e.cc}`);
    // console.log('this.block: ');
    // console.log(this.block);
    let z: number;
    switch ((this.dp % 4 + 4) % 4) {
      case 0:// 右
        bound = -1;
        for (let i = 0; i < this.block.length; i++) {
          z = this.block[i]%W;
          if (bound < z) {
            edge = [this.block[i]];
            bound = z;
          }
          else if (bound === z) {
            edge.push(this.block[i]);
          }
        }
        break;
      case 1:// 下
        bound = -1;
        for (let i = 0; i < this.block.length; i++) {
          z = Math.floor(this.block[i]/W);
          if (bound < z) {
            edge = [this.block[i]];
            bound = z;
          }
          else if (bound === z) {
            edge.push(this.block[i]);
          }
        }
        break;
      case 2:// 左
        bound = W;
        for (let i = 0; i < this.block.length; i++) {
          z = this.block[i]%W;
          if (bound > z) {
            edge = [this.block[i]];
            bound = z;
          }
          else if (bound === z) {
            edge.push(this.block[i]);
          }
        }
        break;
      case 3:// 上
        bound = H;
        for (let i = 0; i < this.block.length; i++) {
          z = Math.floor(this.block[i]/W);
          if (bound > z) {
            edge = [this.block[i]];
            bound = z;
          }
          else if (bound === z) {
            edge.push(this.block[i]);
          }
        }
        break;
    }
    // console.log('edge: ');
    // console.log(edge);
    const d = this.dp + (this.cc % 2 === 0 ? -1 : 1);
    let rtn = -1;
    switch ((d % 4 + 4) % 4) {
      case 0:// 右
        bound = -1;
        for (let i = 0; i < edge.length; i++) {
          if (bound < edge[i]%W) {
            rtn = edge[i];
            bound = edge[i]%W;
          }
        }
        break;
      case 1:// 下
        bound = -1;
        for (let i = 0; i < edge.length; i++) {
          if (bound < Math.floor(edge[i]/W)) {
            rtn = edge[i];
            bound = Math.floor(edge[i]/W);
          }
        }
        break;
      case 2:// 左
        bound = W;
        for (let i = 0; i < edge.length; i++) {
          if (bound > edge[i]%W) {
            rtn = edge[i];
            bound = edge[i]%W;
          }
        }
        break;
      case 3:// 上
        bound = H;
        for (let i = 0; i < edge.length; i++) {
          if (bound > Math.floor(edge[i]/W)) {
            rtn = edge[i];
            bound = Math.floor(edge[i]/W);
          }
        }
        break;
    }
    // console.log('return: ');
    // console.log(rtn);
    return rtn;
  }
}