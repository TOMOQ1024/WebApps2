import update from "./Update";
import render from "./Render";

export default class Core {
  W: number;
  H: number;
  data: boolean[][] = [];
  pendata = false;
  
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  update = update;
  render = render;


  constructor(){
    this.cvs = document.querySelector('#cvs') as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d')!;
    this.W = 64;
    this.H = 64;
    this.init();
  }

  init(){
    this.data = [];
    for(let y=0; y<this.H; y++){
      this.data.push([]);
      for(let x=0; x<this.W; x++){
        // this.data[y].push(false);
        this.data[y].push(Math.random() < .5);
      }
    }
  }

  penDown(x: number, y: number){
    this.pendata = !this.data[y][x];
    this.penMove(x, y);
  }

  penMove(x: number, y: number){
    this.data[y][x] = this.pendata;
  }
}