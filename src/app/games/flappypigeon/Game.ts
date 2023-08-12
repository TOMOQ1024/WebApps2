import { ImageNames, Scene } from "./Utils";

export class Game {
  scene: Scene = 'title';
  width = 10;
  G = .025;
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  keys: {[Key:string]: number} = {};
  timer: number = 0;
  imgs: {[Key:string]: HTMLImageElement} = {};
  now: number = 0;
  dt: number = 0;
  nessyInterval = 60;// ネッシー召喚の間隔[フレーム]
  score = 0;
  fortune: number = 1;
  collided = false;

  player = {
    pos: {
      x: 0,
      y: 0,
    },
    vel: {
      x: 0,
      y: 0,
    },
    dir: 0,
    ddr: 0
  };

  nessy: {
    x: number,
    y: number,
  }[] = [];

  constructor(cvs: HTMLCanvasElement){
    this.cvs = cvs;
    this.ctx = cvs.getContext('2d')!;
    for(let iname in ImageNames){
      this.imgs[iname] = new Image();
      this.imgs[iname].src = `/images/flappypigeon/${ImageNames[iname]}`
    }
  }

  init(){
    this.timer = 0;
    this.score = 0;
    this.player = {
      pos: {
        x: this.width/4,
        y: this.width/2,
      },
      vel: {
        x: 1,
        y: 0,
      },
      dir: 0,
      ddr: 0
    };
    this.nessy = [];
  }
}