import { Game } from "./Game";
import { Params } from "./Params";
import DrawImgAt from "./Render/DrawImgAt";
import { Vec2 } from "./Vec2";

export class Player {
  pos = new Vec2();
  vel = new Vec2();
  dir = 0;
  ddr = 0;
  collided = false;
  stiffness = 1;

  constructor(private _parent: Game){
    this.init();
  }

  init(){
    this.pos = new Vec2( Params.GRIDSIZE/4, Params.GRIDSIZE/2 );
    this.vel = new Vec2( Params.HVELOCITY, 0 );
    this.stiffness = 1;
    this.collided = false;
  }

  update(){
    //
    const {keys, sceneMgr, nessyMgr, timer, mainTimer} = this._parent;
    const { nessies } = nessyMgr;
    if(this.collided){
      this.stiffness *= 1.2;
    }

    // flap
    if(Object.values(keys).filter(k=>k===2).length && !this.collided){
      // this.vel.y -= .7;
      this._parent.interact = true;
      this.vel.y = Params.FLAPVELOCITY;
    };

    // プレイヤーの自由落下
    if(this._parent.interact){
      this.pos.y += this.vel.y * this._parent.dt / this.stiffness;
      this.vel.y += Params.GRAVITY * this._parent.dt / this.stiffness;
    }

    // 速度上昇
    // this.vel.x *= 1.001;

    // 向きの更新
    if(!this.collided)this.dir = this.vel.y * 10;
    else this.dir += this.ddr * this._parent.dt;

    // 地面修正
    this.pos.y = Math.min(this.pos.y, Params.GRIDSIZE-.99);
    
    if(this._parent.sceneMgr.match('resume'))return;

    // 当たり判定
    if(!sceneMgr.match('result')){
      // 当たり判定(ネシ)
      let p = this.pos;
      for(let i=0; i<nessies.length; i++){
        let n = nessies[i];
        if(!n) continue;
        if(
          Math.abs(n.pos.x-p.x) < 1/2 &&
          Math.abs(n.pos.y-p.y) > 1.2
        ){
          this.collided = true;
          timer.setDuration(Params.SCENETRANSITION);
          if(this._parent.mainTimer.isRunning()){
            sceneMgr.set('game_resume_in');
          }
          else{
            sceneMgr.set('game_out');
          }
        }
      }
    
      // 当たり判定(地面)
      if(Params.GRIDSIZE - 1 < p.y){
        this.collided = true;
        timer.setDuration(Params.SCENETRANSITION);
        if(this._parent.mainTimer.isRunning() && !this._parent.sceneMgr.match('resume')){
          sceneMgr.set('game_resume_in');
        }
        else{
          sceneMgr.set('game_out');
        }
        this.ddr = this.vel.x/9;
      }
    }
  }

  render(){
    // let dir = Math.atan2(game.player.vel.y, game.player.vel.x);
    DrawImgAt(
      this._parent,
      this._parent.interact ?
        this.collided ? 'dd' : (this.dir<.03 ? 'f0' : 'f1') :
        (Math.floor(this._parent.now/60)%2 ? 'f0' : 'f1'),
      this.pos.x, this.pos.y, this.dir
    );
  }
}