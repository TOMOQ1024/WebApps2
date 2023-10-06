import { GRIDSIZE, NESSYINTERVAL } from "./Constants";
import { Game } from "./Game";
import Timer from "./Timer";
import { Vec2 } from "./Vec2";

export class NessyMgr {
  nessies: (Nessy|null)[] = [];
  timer: Timer;

  constructor(private _parent: Game) {
    this.timer = new Timer(_parent);
  }

  append(x: number, y: number){
    for(let i=0; i<this.nessies.length; i++){
      if(!this.nessies[i]){
        this.nessies.splice(i, 1, new Nessy(this._parent, i, x, y));
        return;
      }
    }
    this.nessies.push(new Nessy(this._parent, this.nessies.length, x, y));
  }

  remove(index: number){
    this.nessies[index] = null;
  }

  clear(){
    this.nessies = [];
  }

  update(){
    this.nessies.forEach(n=>n?.update());
    if(this.timer.isEnded() && this._parent.interact && !this._parent.player.collided){
      this.append(
        GRIDSIZE+1,
        ((Math.random()-.5)*0.55+.5)*GRIDSIZE
      );
      this.timer.setDuration(NESSYINTERVAL);
    }
  }
}

export class Nessy {
  pos = new Vec2();
  private _manager: NessyMgr;

  constructor(private _parent: Game, private _index: number, x: number, y: number){
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
    }

    // 画面外に行ったときに削除する
    if(this.pos.x < -1){
      this._manager.remove(this._index);
    }
  }
}