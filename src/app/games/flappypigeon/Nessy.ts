import { Game } from "./Game";
import { Params } from "./Params";
import DrawImgAt from "./Render/DrawImgAt";
import Timer from "./Timer";
import { Vec2 } from "./Vec2";

export class NessyMgr {
  nessies: (Nessy|null)[] = [];
  timer: Timer;
  groundPos = 0;
  fixedpos = Params.FIXEDNESSYPOS.slice(0);
  summonCount = 0;

  constructor(private _parent: Game) {
    this.timer = new Timer(_parent);
  }

  append(x: number, y: number){
    this.summonCount++;
    for(let i=0; i<this.nessies.length; i++){
      if(!this.nessies[i]){
        this.nessies.splice(i, 1, new Nessy(this._parent, i, x, y, this.summonCount===Params.BORDER));
        return;
      }
    }
    this.nessies.push(new Nessy(this._parent, this.nessies.length, x, y, this.summonCount===Params.BORDER));
  }

  remove(index: number){
    this.nessies[index] = null;
  }

  init(){
    this.nessies = [];
    this.fixedpos = Params.FIXEDNESSYPOS.slice(0);
    this.summonCount = 0;
  }

  update(){
    this.nessies.forEach(n=>n?.update());
    if(this.timer.isEnded() && this._parent.interact && !this._parent.player.collided){
      if(Params.KITFES){
        this.append(
          Params.GRIDSIZE+1,
          (((this.fixedpos.shift() || Math.random())-.5)*0.55+.5)*Params.GRIDSIZE
        );
      }
      else {
        this.append(
          Params.GRIDSIZE+1,
          ((Math.random()-.5)*0.55+.5)*Params.GRIDSIZE
        );
      }
      this.timer.setDuration(Params.NESSYINTERVAL);
    }
  }

  render(){
    const { ctx } = this._parent;
    const l = Params.CANVASWIDTH / Params.GRIDSIZE;
    let n: typeof this.nessies[number];
  
    // ネシ
    for(let i=0; i<this.nessies.length; i++){
      n = this.nessies[i];
      if(!n) continue;
      for(let j=-Params.GRIDSIZE; j<=Params.GRIDSIZE; j++){
        if(j*j<2) continue;
        ctx.save();
        if(n.isGoal){
          ctx.shadowBlur = l/3;
          ctx.shadowColor = 'yellow';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        DrawImgAt(
          this._parent,
          j*j===4 ? 'nh' : 'nn',
          n.pos.x, n.pos.y+j, Math.sign(-j), 1.05
        );
        ctx.restore();
      }
    }
  
    // 地面
    this.groundPos -= this._parent.player.vel.x/20;
    for(let i=-1; i<=Params.GRIDSIZE+1; i++){
      DrawImgAt(
        this._parent,
        'nn',
        i+((this.groundPos)%1+1)%1-1, Params.GRIDSIZE-.5, 0, 1.05
      );
    }
  }
}

export class Nessy {
  pos = new Vec2();
  private _manager: NessyMgr;

  constructor(private _parent: Game, private _index: number, x: number, y: number, public isGoal=false){
    this._manager = _parent.nessyMgr;
    this.pos.x = x;
    this.pos.y = y;
  }

  update(){
    const { player } = this._parent;
    // プレイヤーの速度に合わせて移動させる
    let prevX = this.pos.x;
    this.pos.x -= player.vel.x * this._parent.dt / player.stiffness;
    let pX = player.pos.x;
    // プレイヤーを(が)ネッシーが(を)跨いだとき，スコアを加算する
    if(pX < prevX && this.pos.x < pX){
      this._parent.score += 1;
      this._parent.highScore = Math.max(this._parent.highScore, this._parent.score);
    }

    // 画面外に行ったときに削除する
    if(this.pos.x < -1){
      this._manager.remove(this._index);
    }
  }
}