import Core from "./Core";

export default class _Stack {
  stack: number[] = [];

  constructor (public parent: Core) { }

  get len () {
    return this.stack.length;
  }

  clear () {
    this.stack = [];
  }

  psh (x: number) {
    return this.stack.push(x);
  }

  pop () {
    return this.stack.pop() || 0;
  }

  add () {
    if (this.len < 2) return NaN;
    const a = this.pop();
    const b = this.pop();
    return this.psh(b + a);
  }

  sub () {
    if (this.len < 2) return NaN;
    const a = this.pop();
    const b = this.pop();
    return this.psh(b - a);
  }

  mul () {
    if (this.len < 2) return NaN;
    const a = this.pop();
    const b = this.pop();
    return this.psh(b * a);
  }

  div () {
    if (this.len < 2) return NaN;
    const a = this.pop();
    const b = this.pop();
    return this.psh(Math.floor(b / a));
  }

  mod () {
    if (this.len < 2) return NaN;
    const a = this.pop();
    const b = this.pop();
    return this.psh(b % a);
  }

  not () {
    if (this.len < 1) return NaN;
    const a = this.pop();
    return this.psh(+!a);
  }

  grt () {
    if (this.len < 2) return NaN;
    const a = this.pop();
    const b = this.pop();
    return this.psh(+(b>a));
  }

  pnt () {
    if (this.len < 1) return NaN;
    const a = this.pop();
    return this.parent.pp.dp += a;
  }

  swt () {
    if (this.len < 1) return NaN;
    const a = this.pop();
    return this.parent.pp.cc += a;
  }

  dup () {
    if (this.len < 1) return NaN;
    const a = this.stack[this.len-1];
    return this.psh(a);
  }

  rol () {
    if (this.len < 2) return NaN;
    let a = this.pop();// time
    const b = this.pop();// depth
    let p: number;
    if(b < 0 || this.len < b){
      // rollの深さが負，またはスタックサイズを超過する場合
      // このときどうすればいいのかわからん
      // とりあえず戻しとく
      this.psh(b);
      this.psh(a);
      return NaN;
    }
    a = (a%b + b) % b;
    for(let i=0; i<a; i++){
      p = this.pop()!;
      this.stack.splice(this.len-b+1,0,p);
    }
    return a;
  }

  inn () {
    const num = this.parent.input.match(/^\s*[+-]?\d+/u);
    if(num){
      this.parent.input = this.parent.input.slice(num[0].length);
      this.psh(parseInt(num[0]));
    }
    else {
      return NaN;
    }
  }

  inc () {
    let i = this.parent.input.codePointAt(0);
    this.psh(Number.isInteger(i) ? i! : 0);
    this.parent.input = Array.from(this.parent.input).slice(1).join('');
  }

  otn () {
    if (this.len < 1) return NaN;
    let i = this.pop()!;
    this.parent.output += `${i}`;
    console.log(`%c${i}`, 'color:#ff8000; font-size:20px;');
  }

  otc () {
    if (this.len < 1) return NaN;
    let i = this.pop()!;
    this.parent.output += String.fromCodePoint(i);
    console.log(`%c${String.fromCodePoint(i)}`, 'color:#ffff00; font-size:20px;');
  }
}