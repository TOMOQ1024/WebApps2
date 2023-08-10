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
      if(Object.values(game.keys).filter(v=>v).length){
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
    case 'result':
      game.timer = Math.min(game.timer+0.03, 1);
      if(game.keys.r){
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
  for(let i=0; i<game.nessy.length; i++){
    game.nessy[i].x -= game.player.vel.x/20;
    if(game.nessy[i].x < -1){
      game.nessy.splice(i--, 1);
    }
  }
  if(game.timer === 0){
    game.nessy.push({
      x: game.width+1,
      y: (0.2+Math.random()*0.6)*game.width
    });
  }
}

function UpdatePlayer(game: Game){
  // flap
  if(Object.values(game.keys).filter(k=>k===2).length){
    // game.player.vel.y -= .7;
    game.player.vel.y = -0.3;
  };

  // プレイヤーの自由落下
  game.player.pos.y += game.player.vel.y;
  game.player.vel.y += game.G;

  // 速度上昇
  // game.player.vel.x *= 1.001;
}
