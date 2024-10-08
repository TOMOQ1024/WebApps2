import { Game } from "./Game";

export default function Update(game: Game) {
  // console.log(game.scene);
  for(let key in game.keys){
    if(game.keys[key] === 2){
      game.keys[key] = 1;
    }
  }

  UpdateEmojis(game);
  UpdateSLabels(game);

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
      game.timer = game.playtime;
      game.scene = 'game';
      break;
    case 'game':
      if((game.timer -= game.dt) < 0){
        game.timer = 0;
        game.scene = 'result';
        break;
      };
      if(game.keys[' '] === 2)game.pmoveback(false);
      if(game.keys.d === 2 || game.keys.arrowright === 2)game.pmove(0, false);
      if(game.keys.s === 2 || game.keys.arrowdown === 2)game.pmove(1, false);
      if(game.keys.a === 2 || game.keys.arrowleft === 2)game.pmove(2, false);
      if(game.keys.w === 2 || game.keys.arrowup === 2)game.pmove(3, false);
      if(game.keys[' '] === 1)game.pmoveback(true);
      if(game.keys.d === 1 || game.keys.arrowright === 1)game.pmove(0, true);
      if(game.keys.s === 1 || game.keys.arrowdown === 1)game.pmove(1, true);
      if(game.keys.a === 1 || game.keys.arrowleft === 1)game.pmove(2, true);
      if(game.keys.w === 1 || game.keys.arrowup === 1)game.pmove(3, true);
      if(game.keys['shift']){
        if(game.keys[' '] === 1)game.pmoveback(true);
        if(game.keys.d || game.keys.arrowright === 1)game.pmove(0, true);
        if(game.keys.s || game.keys.arrowdown === 1)game.pmove(1, true);
        if(game.keys.a || game.keys.arrowleft === 1)game.pmove(2, true);
        if(game.keys.w || game.keys.arrowup === 1)game.pmove(3, true);
      }
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
}

function UpdateEmojis(game: Game){
  let e: typeof game.emojis[number];
  const dc = performance.now() - game.score.lastUpdate;

  for(let i=0; i<game.emojis.length; i++){
    e = game.emojis[i];
    if(e.x === game.player.head.x && e.y === game.player.head.y){
      game.score.streaks += 1;
      // console.log(game.emojis.splice(i, 1)[1]);
      game.emojis.splice(i, 1);
      game.score.delta = 100/(game.player.path.length-1);
      game.score.current += game.score.delta * (game.score.streaks+1);
      game.score.lastUpdate = performance.now();
      game.slabels.push({
        score: Math.floor(game.score.delta),
        since: performance.now(),
        x: e.x + 0.5,
        y: e.y + 0.5,
      });

      game.pushEmoji();
      for(let i=0; i<game.fortune; i++){
        if(Math.random() < 0.05)game.pushEmoji();
      }
      return;
    }
  }

  if(game.score.mdc <= dc){
    game.score.streaks = 0;
  }
}

function UpdateSLabels(game: Game){
  for(let i=0; i<game.slabels.length; i++){
    if(1000 < performance.now() - game.slabels[i].since){
      game.slabels.splice(i--, 1);
    }
  }
}
