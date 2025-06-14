import GraphMgr from "@/src/GraphMgrOld";
import MouseMgr from "@/src/MouseMgr";
import TouchMgr from "@/src/TouchMgr";
import Vec3 from "@/src/Vec3";
import { Seed, sNFlake } from "./Definitions";
import GLMgr from "./GLMgr";
import Render from "./Render";
import Update from "./Update";

export default class CCore {
  cvs: HTMLCanvasElement|null = null;
  ctx: CanvasRenderingContext2D|null = null;
  seeds: Seed = sNFlake(5);
  p = new Vec3(0, 0, 1);
  interval: NodeJS.Timeout|null = null;
  graph = new GraphMgr();
  tmgr = new TouchMgr();
  mmgr = new MouseMgr();
  glmgr = new GLMgr();
  update = Update;
  render = Render;
  isCvsResized = true;
  resFactor = 1;

  init () {
    this.cvs = document.querySelector('#cvs')!;
    this.ctx = this.cvs.getContext('2d')!;
  }

  beginLoop () {
    console.log('b');
    setTimeout(()=>{
      this.ctx!.lineWidth = 1;
      this.ctx!.fillStyle = 'white';
      this.ctx!.fillRect(0, 0, this.cvs!.width, this.cvs!.height);
      this.ctx!.translate(this.cvs!.width/2, this.cvs!.height/2);
      this.ctx!.fillStyle = 'black';
    }, 1000/50);
    this.interval = setInterval(()=>{
      for (let i=0; i<1000; i++) {
        this.loop();
      }
    }, 1000/60);
  }

  endLoop () {
    clearInterval(this.interval!);
  }

  loop () {
    this.update();
    this.render();
  }
}