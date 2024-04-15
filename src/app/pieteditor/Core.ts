import { Vector2 } from "three";
import { COLORS, Colors } from "./Definitions";

export default class Core {
  crnt = new Vector2(0, 0);
  next = new Vector2(-1, -1);
  size = new Vector2(10, 10);
  code: COLORS[][] = [];
  codelSize = 40;
  codeHistory: string[][][] = [];
  currentCodeAt = 0;
  dp = 0;
  cc = 0;
  block: Vector2[] = [];
  stuckCount = 0;
  isHalted = false;
  stack: number[] = [];
  input = '';
  output = '';
  fillColor: [COLORS, COLORS] = [COLORS.W, COLORS.K];
  ctrl = 'draw';
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  isMouseDown = false;

  constructor () {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d')!;
    this.init();
    this.draw();
  }
  
  init () {
    this.code = [];
    for (let y=0; y<this.size.y; y++) {
      this.code.push([]);
      for (let x=0; x<this.size.x; x++) {
        this.code[y].push((x+y*this.size.x)%Colors.length);
      }
    }
  }

  setCodel (x: number, y: number, f = false) {
    const c = this.fillColor[f ? 1 : 0];
    if (this.code[y][x] === c) return false;
    this.code[y][x] = c;
    return true;
  }

  draw () {
    let c: COLORS;
    for (let y=0; y<this.size.y; y++) {
      for (let x=0; x<this.size.x; x++) {
        c = this.code[y][x];
        this.ctx.fillStyle = Colors[c];
        this.ctx.fillRect(x*this.codelSize, y*this.codelSize, this.codelSize, this.codelSize);
      }
    }
  }
}
