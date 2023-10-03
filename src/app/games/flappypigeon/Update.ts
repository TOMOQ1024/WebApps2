import { GRAVITY, GRIDSIZE, SCENETRANSITION } from "./Constants";
import { Game } from "./Game";

export default function Update(game: Game) {
  let {timer, sceneMgr, keys, ctx} = game;
  const now = performance.now();
  game.dt = now - game.now;
  game.now = now;
  switch(sceneMgr.current){
    case 'title_in':
      if(timer.isEnded()) sceneMgr.next();
      break;
    case 'title':
      if(Object.entries(keys).filter(([k,t])=>t===2&&k!=='_m_mouse').length){
        timer.setDuration(SCENETRANSITION);
        sceneMgr.next();
      }
      break;
    case 'title_out':
      if(timer.isEnded()){
        timer.setDuration(SCENETRANSITION);
        game.init();
        sceneMgr.next();
        break;
      }
      break;
    case 'game_in':
      if(timer.isEnded()){
        sceneMgr.next();
        break;
      }
    case 'game':
      // if(timer.isEnded()){
      //   // timer += game.nessyInterval;
      // }
      
      UpdatePlayer(game);
      UpdateNessy(game);
      break;
    case 'game_out':
      sceneMgr.next();
    case 'result_in':
      // timer = 0;
      sceneMgr.next();
      break;
    case 'result':
      // timer = Math.min(timer+0.03, 1);
      UpdatePlayer(game);
      UpdateNessy(game);
      if(keys.r === 2){
        timer.setDuration(SCENETRANSITION);
        sceneMgr.next();
      }
      break;
    case 'result_out':
      if(timer.isEnded()){
        timer.setDuration(SCENETRANSITION);
        sceneMgr.next();
      }
      break;
  }

  // キー状態の更新
  for(let key in keys){
    if(keys[key] === 2){
      keys[key] = 1;
    }
  }
}


function UpdateNessy(game: Game){
  let {timer, player} = game;

  for(let i=0; i<game.nessy.length; i++){

    // プレイヤーの速度に合わせて移動させる
    let prevX = game.nessy[i].x;
    game.nessy[i].x -= player.vel.x * game.dt;
    let pX = player.pos.x;
    // プレイヤーを(が)ネッシーが(を)跨いだとき，スコアを加算する
    if(pX < prevX && game.nessy[i].x < pX){
      game.score += 1;
    }

    // 画面外に行ったときに削除する
    if(game.nessy[i].x < -1){
      game.nessy.splice(i--, 1);
    }
  }
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  if(false && game.interact && !game.collided){
    game.nessy.push({
      x: GRIDSIZE+1,
      y: ((Math.random()-.5)*0.55+.5)*GRIDSIZE
    });
  }
}

function UpdatePlayer(game: Game){
  let {player, keys, sceneMgr, timer} = game;
  if(game.collided){
    player.vel.x *= 0.8;
    player.vel.y *= 0.8;
    player.ddr *= 0.9;
  }

  // flap
  if(Object.values(keys).filter(k=>k===2).length && !game.collided){
    // player.vel.y -= .7;
    game.interact = true;
    player.vel.y = -8e-3;
  };

  // プレイヤーの自由落下
  if(game.interact){
    player.pos.y += player.vel.y * game.dt;
    player.vel.y += GRAVITY * game.dt;
  }

  // 速度上昇
  // player.vel.x *= 1.001;

  // 向きの更新
  if(!game.collided)player.dir = player.vel.y/2;
  else player.dir += player.ddr * game.dt;

  // 当たり判定
  if(!sceneMgr.match('result')){
    // 当たり判定(ネシ)
    let p = player.pos;
    for(let i=0; i<game.nessy.length; i++){
      let n = game.nessy[i];
      if(
        Math.abs(n.x-p.x) < 1/2 &&
        Math.abs(n.y-p.y) > 1.2
      ){
        game.collided = true;
        timer.setDuration(SCENETRANSITION);
        sceneMgr.next();
      }
    }
  
    // 当たり判定(地面)
    if(GRIDSIZE - 1 < p.y){
      game.collided = true;
      timer.setDuration(SCENETRANSITION);
      sceneMgr.next();
      player.ddr = player.vel.x/9;
    }
  }

  // 地面修正
  player.pos.y = Math.min(player.pos.y, GRIDSIZE-1);
}
