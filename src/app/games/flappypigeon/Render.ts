import { Game } from "./Game";
import a2dp from "./Utils";

export default function Render(game: Game){
  game.ctx.globalAlpha = 1.0;
  game.ctx.fillStyle = '#eee';

  // background
  const l = game.cvs.width/game.width;
  game.ctx.save();
  game.ctx.globalAlpha = 1;
  game.ctx.fillStyle = '#acf';
  game.ctx.fillRect(0, 0, game.cvs.width, game.cvs.height);
  game.ctx.restore();

  game.ctx.textAlign = 'center';

  switch(game.scene){
    case '->title':
    case 'title->':
      game.ctx.globalAlpha = 1 - game.timer;
    case 'title':
      game.ctx.fillStyle = 'black';
      game.ctx.font = `${game.cvs.height/5}px serif`;
      game.ctx.fillText('FlappyPigeon', game.cvs.width/2, game.cvs.height/2.5, game.cvs.width*0.8);
      game.ctx.font = `${game.cvs.height/30}px serif`;
      game.ctx.fillText('PRESS ANY KEY TO START', game.cvs.width/2, game.cvs.height/4*3);
      drawImgAt(game, 'nc', game.width-2, game.width-1);
      break;
    case '->game':
      break;
    case 'game':
      drawPlayer(game);
      drawNessy(game);
      drawMenu(game);
      break;
    // case 'game->':
    //   break;
    case 'result->':
      game.ctx.globalAlpha = game.timer;
    case 'result':
      break;
  }
}

function drawPlayer(game: Game){
  const pos = game.player.pos;
  let dir = game.player.vel.y/2;
  // let dir = Math.atan2(game.player.vel.y, game.player.vel.x);
  drawImgAt(
    game,
    dir<.03 ? 'f0' : 'f1',
    pos.x, pos.y, dir
  );
}

function drawNessy(game: Game){
  const l = game.cvs.width / game.width;
  let n: typeof game.nessy[number];
  for(let i=0; i<game.nessy.length; i++){
    n = game.nessy[i];
    for(let j=-game.width; j<=game.width; j++){
      if(j*j<2) continue;
      drawImgAt(
        game,
        j*j===4 ? 'nh' : 'nn',
        n.x, n.y+j, Math.sign(-j)
      );
    }
  }
}

function drawImgAt(game: Game, imgName: string, x: number, y: number, angle=0, scale=1){
  if(!game.imgs[imgName])return;
  const l = game.cvs.width/game.width;
  game.ctx.save();
  // game.ctx.globalAlpha = 0.1;
  game.ctx.translate(x*l, y*l);
  game.ctx.translate(l/2, l/2);
  game.ctx.rotate(angle*Math.PI/2);
  game.ctx.scale(scale, scale);
  game.ctx.translate(-l/2, -l/2);
  game.ctx.drawImage(game.imgs[imgName], 0, 0, l, l);
  game.ctx.restore();
}

function drawMenu(game: Game){
  const l = game.cvs.width / game.width;
  const dc = performance.now() - game.score.lastUpdate;

  // スコア表示
  game.ctx.save();
  game.ctx.fillStyle = '#44444444';
  game.ctx.textAlign = 'left';
  game.ctx.textBaseline = 'middle';
  game.ctx.fillText('(score here)', l/2, l/2);


  game.ctx.restore();
}
