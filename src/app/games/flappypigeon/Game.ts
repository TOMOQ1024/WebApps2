import { NessyMgr } from "./Nessy";
import { Player } from "./Player";
import { SceneMgr } from "./Scene";
import Timer from "./Timer";
import { ImageNames } from "./Utils";

export class Game {
  sceneMgr = new SceneMgr(this);
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  keys: {[Key:string]: number} = {};
  timer = new Timer(this);
  mainTimer = new Timer(this);
  imgs: {[Key:string]: HTMLImageElement} = {};
  now: number = 0;
  dt: number = 0;
  score = 0;
  highScore = 0;
  interact = false;
  timeover = false;

  player = new Player(this);
  nessyMgr = new NessyMgr(this);

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
    this.highScore = 0;
    this.interact = false;
    this.timeover = false;
    this.player.init();
    this.player.clearGrave();
    this.nessyMgr.init();
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