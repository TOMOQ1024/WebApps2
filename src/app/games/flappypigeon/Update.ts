import { Game } from "./Game";

export default function Update(game: Game) {
  const now = performance.now();
  game.dt = now - game.now;
  game.now = now;
  switch(game.scene){
    case '->title':
      game.timer -= 0.03;
      if(game.timer < 0){
        game.scene = 'title';
      }
      break;
    case 'title':
      if(Object.entries(game.keys).filter(([k,t])=>t===2&&k!=='_m_mouse').length){
        game.timer = 0;
        game.scene = 'title->';
      }
      break;
    case 'title->':
      game.timer += 0.03;
      if(1.0 < game.timer){
        game.ctx.globalAlpha = 1.0;
        game.scene = '->game';
        break;
      }
      break;
    case '->game':
      game.init();
      game.timer = game.nessyInterval;
      game.scene = 'game';
      break;
    case 'game':
      game.timer -= 1;
      if(game.timer < 0){
        game.timer += game.nessyInterval;
      }
      
      UpdatePlayer(game);
      UpdateNessy(game);
      break;
    // case 'game->':
    //   break;
    case '->result':
      game.timer = 0;
      game.scene = 'result';
      break;
    case 'result':
      game.timer = Math.min(game.timer+0.03, 1);
      UpdatePlayer(game);
      UpdateNessy(game);
      if(game.keys.r === 2){
        game.scene = 'result->';
      }
      break;
    case 'result->':
      game.timer -= 0.03;
      if(game.timer < 0){
        game.timer = 1;
        game.scene = '->title';
      }
      break;
  }

  // キー状態の更新
  for(let key in game.keys){
    if(game.keys[key] === 2){
      game.keys[key] = 1;
    }
  }
}


function UpdateNessy(game: Game){
  // if(game.collided)return;

  for(let i=0; i<game.nessy.length; i++){

    // プレイヤーの速度に合わせて移動させる
    let prevX = game.nessy[i].x;
    game.nessy[i].x -= game.player.vel.x/20;
    let pX = game.player.pos.x;
    // プレイヤーを(が)ネッシーが(を)跨いだとき，スコアを加算する
    if(pX < prevX && game.nessy[i].x < pX){
      game.score += 1;
    }

    // 画面外に行ったときに削除する
    if(game.nessy[i].x < -1){
      game.nessy.splice(i--, 1);
    }
  }
  if(game.timer === 0 && game.interact && !game.collided){
    game.nessy.push({
      x: game.width+1,
      y: ((Math.random()-.5)*0.55+.5)*game.width
    });
  }
}

function UpdatePlayer(game: Game){
  if(game.collided){
    game.G *= 0.5;
    game.player.vel.x *= 0.8;
    game.player.vel.y *= 0.8;
    game.player.ddr *= 0.9;
  }

  // flap
  if(Object.values(game.keys).filter(k=>k===2).length && !game.collided){
    // game.player.vel.y -= .7;
    game.interact = true;
    game.player.vel.y = -0.3;
  };

  // プレイヤーの自由落下
  if(game.interact){
    game.player.pos.y += game.player.vel.y;
    game.player.vel.y += game.G;
  }

  // 速度上昇
  // game.player.vel.x *= 1.001;

  // 向きの更新
  if(!game.collided)game.player.dir = game.player.vel.y/2;
  else game.player.dir += game.player.ddr;

  // 当たり判定
  if(!game.scene.match('result')){
    // 当たり判定(ネシ)
    let p = game.player.pos;
    for(let i=0; i<game.nessy.length; i++){
      let n = game.nessy[i];
      if(
        Math.abs(n.x-p.x) < 1/2 &&
        Math.abs(n.y-p.y) > 1.2
      ){
        game.collided = true;
        game.scene = '->result';
      }
    }
  
    // 当たり判定(地面)
    if(game.width - 1 < p.y){
      game.collided = true;
      game.scene = '->result';
      game.player.ddr = game.player.vel.x/9;
    }
  }

  // 地面修正
  game.player.pos.y = Math.min(game.player.pos.y, game.width-1);
}
