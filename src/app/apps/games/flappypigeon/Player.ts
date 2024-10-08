import { Game } from "./Game";
import { Params } from "./Params";
import DrawImgAt from "./Render/DrawImgAt";
import Timer from "./Timer";
import { Vec2 } from "./Vec2";

export class Player {
  pos = new Vec2();
  vel = new Vec2();
  dir = 0;
  ddr = 0;
  collided = false;
  stiffness = 1;
  timer: Timer;
  gravePos: Vec2[] = [];

  constructor(private _parent: Game){
    this.timer = new Timer(_parent);
    this.init();
  }

  clearGrave(){
    this.gravePos = [];
  }

  init(){
    this.pos = new Vec2( Params.GRIDSIZE/4, Params.GRIDSIZE/2 );
    this.vel = new Vec2( Params.HVELOCITY, 0 );
    this.stiffness = 1;
    this.collided = false;
    this.timer.setDuration(Infinity);
    this.timer.pause();
  }

  update(){
    const {keys, sceneMgr, nessyMgr, timer, mainTimer} = this._parent;
    const { nessies } = nessyMgr;
    if(this.collided){
      this.stiffness *= 1.2;
    }

    // flap
    if(Object.values(keys).filter(k=>k===2).length && !this.collided){
      // this.vel.y -= .7;
      this._parent.interact = true;
      if(Params.KITFES && mainTimer.isPausing())mainTimer.unpause();
      this.vel.y = Params.FLAPVELOCITY;
    };

    // プレイヤーの自由落下
    if(this._parent.interact){
      this.timer.unpause();
      this.pos.y += this.vel.y * this._parent.dt / this.stiffness;
      this.vel.y += Params.GRAVITY * this._parent.dt / this.stiffness;
    }

    // 速度上昇
    // this.vel.x *= 1.001;

    // 向きの更新
    if(!this.collided)this.dir = this.vel.y * 10;
    else this.dir += this.ddr * this._parent.dt / this.stiffness;

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
          this.die();
        }
      }
    
      // 当たり判定(地面)
      if(Params.GRIDSIZE - 1 < p.y){
        this.die();
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

    // const { ctx } = this._parent;
    // ctx.strokeStyle = '#f00';
    // const l = Params.CANVASWIDTH / Params.GRIDSIZE;
    // this.gravePos.forEach(g=>{
    //   ctx.save();
    //   ctx.translate(((g.x-this.timer.getConsumedTime())*Params.HVELOCITY + this.pos.x+.5)*l, (g.y+.5)*l);
    //   ctx.beginPath();
    //   ctx.moveTo(+l/4, +l/4);
    //   ctx.lineTo(-l/4, -l/4);
    //   ctx.moveTo(+l/4, -l/4);
    //   ctx.lineTo(-l/4, +l/4);
    //   ctx.stroke();
    //   ctx.restore();
    // });
  }

  die(){
    console.log('pause!');
    this.collided = true;
    this.timer.pause();
    this.gravePos.push(new Vec2(
      this.timer.getConsumedTime(),
      this.pos.y
    ));
    this._parent.timer.setDuration(Params.SCENETRANSITION);
    if(Params.KITFES && this._parent.mainTimer.isRunning() && !this._parent.sceneMgr.match('resume')){
      this._parent.mainTimer.pause();
      this._parent.sceneMgr.set('game_resume_in');
    }
    else{
      this._parent.sceneMgr.set('game_out');
    }
  }
}