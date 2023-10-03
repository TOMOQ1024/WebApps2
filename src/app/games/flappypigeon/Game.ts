import { GRIDSIZE } from "./Constants";
import { SceneMgr } from "./Scene";
import Timer from "./Timer";
import { ImageNames } from "./Utils";

export class Game {
  sceneMgr = new SceneMgr(this);
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  keys: {[Key:string]: number} = {};
  timer = new Timer(this);
  imgs: {[Key:string]: HTMLImageElement} = {};
  now: number = 0;
  dt: number = 0;
  nessyInterval = 60;// ネッシー召喚の間隔[フレーム]
  score = 0;
  fortune: number = 1;
  interact = false;
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
      this.imgs[iname].src = `/resources/flappypigeon/${ImageNames[iname]}`
    }
  }

  init(){
    this.score = 0;
    this.player = {
      pos: {
        x: GRIDSIZE/4,
        y: GRIDSIZE/2,
      },
      vel: {
        x: 1e-3,
        y: 0,
      },
      dir: 0,
      ddr: 0
    };
    this.collided = false;
    this.interact = false;
    this.nessy = [];
  }

  keyDown(keyName: string) {
    if(!this.keys[keyName]){
      this.keys[keyName] = 2;
    }
  }

  keyUp(keyName: string) {
    if(this.keys[keyName] === 2){
      setTimeout(() => {
        this.keys[keyName] = 0;
      }, 20);
    }
    else {
      this.keys[keyName] = 0;
    }
  }
}