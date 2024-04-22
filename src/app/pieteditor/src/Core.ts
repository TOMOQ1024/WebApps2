import { Vector2 } from "three";
import { COLORS, Colors, TOOLS } from "./Definitions";
import ProgramPointer from "./ProgramPointer";
import Stack from "./Stack";

export default class Core {
  pp = new ProgramPointer(this);
  size = new Vector2(10, 10);
  code: COLORS[] = [];
  codelSize = 40;
  codeHistory: string[][][] = [];
  currentCodeAt = 0;
  stack = new Stack(this);
  input = '';
  output = '';
  fillColor: [COLORS, COLORS] = [COLORS.W, COLORS.K];
  ctrl = 'draw';
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tool = TOOLS.PENCIL;

  constructor () {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d')!;
    this.init();
    this.draw();
  }
  
  init () {
    this.code = [];
    for (let y=0; y<this.size.y; y++) {
      for (let x=0; x<this.size.x; x++) {
        this.code.push(COLORS.W);
        // this.code[y].push((x+y*this.size.x)%Colors.length);
      }
    }
  }

  getBlock (x: number, y: number, b: number[] = []) {
    if (x < 0) return b;
    if (y < 0) return b;
    if (this.size.x<=x) return b;
    if (this.size.y<=y) return b;
    const I = y*this.size.x+x;
    if (b.indexOf(I) < 0) {
      if (b.length && this.code[b[0]]!==this.code[I]) return b;
      b.push(I);
      this.getBlock(x-1, y, b);
      this.getBlock(x+1, y, b);
      this.getBlock(x, y-1, b);
      this.getBlock(x, y+1, b);
    }
    return b;
  }

  fillCodel (x: number, y: number, f = false) {
    const c = this.fillColor[f ? 1 : 0];
    switch (this.tool) {
      case TOOLS.PENCIL: {
        if (this.code[y*this.size.x+x] === c) return false;
        this.code[y*this.size.x+x] = c;
        return true;
      }
      case TOOLS.BUCKET: {
        if (this.code[y*this.size.x+x] === c) return false;
        const b = this.getBlock(x, y);
        this.code[y*this.size.x+x] = c;
        for (let i=0; i<b.length; i++) {
          this.code[b[i]] = c;
        }
        return true;
      }
      default:
        console.log('default fillCodel');
        return;
    }
  }

  draw () {
    let c: COLORS;
    for (let y=0; y<this.size.y; y++) {
      for (let x=0; x<this.size.x; x++) {
        c = this.code[y*this.size.x+x];
        this.ctx.fillStyle = Colors[c];
        this.ctx.fillRect(x*this.codelSize, y*this.codelSize, this.codelSize, this.codelSize);
      }
    }

    this.ctx.save();
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = this.codelSize / 640;
    this.ctx.lineCap = this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.scale(this.codelSize, this.codelSize);
    this.ctx.translate(
      this.pp.currentX - .0,
      this.pp.currentY - .0
    );
    this.ctx.rotate(Math.PI * .5 * (this.pp.dp + (this.pp.cc % 2 * 2 - 1) * .1));
    this.ctx.beginPath();
    [0, 1].forEach(i => {
      this.ctx.moveTo(.3 * i + .25, .3);
      this.ctx.lineTo(.3 * i + .5, .5);
      this.ctx.lineTo(.3 * i + .25, .7);
    });
    this.ctx.stroke();
    this.ctx.restore();
  }
}
