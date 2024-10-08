import a2dp, { ImageNames, IsIn_p, Scene } from "./Utils";

export class Game {
  scene: Scene = 'title';
  width = 16;
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  keys: {[Key:string]: number} = {};
  timer: number = 0;
  imgs: {[Key:string]: HTMLImageElement} = {};
  playtime = 60000;
  now: number = 0;
  dt: number = 0;
  score = {
    current: 0,
    delta: 0,
    lastUpdate: 0,
    streaks: 0,
    get mdc(){
      return 2800 / (this.streaks+1) + 200;
    }
  };
  fortune: number = 1;

  player = {
    origin: { x: 0, y: 0 },
    head: { x: 0, y: 0 },
    path: [0],
  };

  emojis: {
    n: string,
    b: number,
    x: number,
    y: number,
  }[] = [];

  slabels: {
    score: number,
    since: number,
    x: number,
    y: number,
  }[] = [];

  constructor(cvs: HTMLCanvasElement){
    this.cvs = cvs;
    this.ctx = cvs.getContext('2d')!;
    for(let iname in ImageNames){
      this.imgs[iname] = new Image();
      this.imgs[iname].src = `/images/nessy/${ImageNames[iname]}`
    }
  }

  init(){
    this.timer = 0;
    this.score.current = 0;
    this.player = {
      origin: {
        x: this.width - 1,
        y: this.width - 1
      },
      head: {
        x: this.width - 2,
        y: this.width - 1
      },
      path: [2,2],
    }
    this.emojis = [];
    this.pushEmoji();
    this.slabels = [];
  }

  pushEmoji(){
    let pos: {x:number, y:number};
    do {
      pos = {
        x: Math.floor(Math.random()*this.width),
        y: Math.floor(Math.random()*this.width),
      }
    } while(
      IsIn_p(pos, this.width-1, this.width-1, 1, 1) ||
      IsIn_p(pos, 0, 0, 5, 2)
    );

    this.emojis.push({
      n: 'np',
      b: performance.now(),
      x: pos.x,
      y: pos.y,
    });
  }

  pmove_timer = 0;
  pmove(d: number, delay=false){
    // 入力の破棄(80%)
    if(delay && this.pmove_timer++%5)return;
    const last = (this.player.path[this.player.path.length-1]%4+4)%4;
    d = (d%4+4)%4;

    let head = {...this.player.head};
    let dpos = a2dp(d);
    head.x += dpos.x;
    head.y += dpos.y;

    if(
      !IsIn_p(head, 0, 0, this.width, this.width) ||
      IsIn_p(head, 0, 0, 5, 2)
    ){
      // console.log('control ignored');
      return;
    }

    if(d === (last+2)%4 && 2<this.player.path.length){
      this.player.path.pop();
      this.player.head = head;
    }
    else if(2 < this.player.path.length || d) {
      this.player.path.push(d);
      this.player.head = head;
    }
    // console.log(this.player.head);
  }

  pmoveback_timer = 0;

  pmoveback(delay=false){
    if(delay && this.pmoveback_timer++%3)return;
    const p = this.player.path;
    if(p.length <= 2) return;
    this.pmove(p[p.length-1]+2);
  }
}