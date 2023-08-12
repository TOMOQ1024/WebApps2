import { Game } from "./Game";

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
      drawNessy(game);
      drawPlayer(game);
      drawMenu(game);
      break;
    // case 'game->':
    //   break;
    case 'result->':
      game.ctx.globalAlpha = game.timer;
    case '->result':
    case 'result':
      drawNessy(game);
      drawPlayer(game);
      drawMenu(game);
      game.ctx.textBaseline = 'middle';
      game.ctx.fillStyle = '#ffffff'+Math.floor(game.timer*188).toString(16).padStart(2,'0');
      game.ctx.fillRect(0, 0, game.cvs.width, game.cvs.height);
      game.ctx.fillStyle = '#000000'+Math.floor(game.timer*160).toString(16).padStart(2,'0');
      game.ctx.fillRect(0, game.cvs.height*0.2, game.cvs.width, game.cvs.height*0.6);
      game.ctx.fillStyle = '#fff';
      game.ctx.textAlign = 'center';
      game.ctx.font = `${game.cvs.height/9}px serif`;
      game.ctx.fillText(`Result`, game.cvs.width/2, game.cvs.height*0.3);
      game.ctx.textAlign = 'center';
      game.ctx.font = `${game.cvs.height/6}px serif`;
      game.ctx.fillText(`${game.score}`, game.cvs.width*0.5, game.cvs.height*0.5);
      game.ctx.font = `${game.cvs.height/17}px serif`;
      game.ctx.textAlign = 'center';
      game.ctx.fillText(`PRESS R KEY TO TITLE`, game.cvs.width/2, game.cvs.height*0.7);
      break;
  }
}

function drawPlayer(game: Game){
  const pos = game.player.pos;
  let dir = game.player.dir;
  // let dir = Math.atan2(game.player.vel.y, game.player.vel.x);
  drawImgAt(
    game,
    game.interact ?
      game.collided ? 'dd' : (dir<.03 ? 'f0' : 'f1') :
      (Math.floor(game.timer/3)%2 ? 'f0' : 'f1'),
    pos.x, pos.y, dir
  );
}

let groundPos = 0;
function drawNessy(game: Game){
  const l = game.cvs.width / game.width;
  let n: typeof game.nessy[number];

  // ネシ
  for(let i=0; i<game.nessy.length; i++){
    n = game.nessy[i];
    for(let j=-game.width; j<=game.width; j++){
      if(j*j<2) continue;
      drawImgAt(
        game,
        j*j===4 ? 'nh' : 'nn',
        n.x, n.y+j, Math.sign(-j), 1.05
      );
    }
  }

  // 地面
  groundPos -= game.player.vel.x/20;
  for(let i=-1; i<=game.width+1; i++){
    drawImgAt(
      game,
      'nn',
      i+((groundPos)%1+1)%1-1, game.width-.5, 0, 1.05
    );
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

  // スコア表示
  game.ctx.save();
  game.ctx.fillStyle = 'black';
  game.ctx.textAlign = 'left';
  game.ctx.textBaseline = 'top';
  game.ctx.font = `${l}px serif`;
  game.ctx.fillText(`${game.score}`, l/2, l/2);

  game.ctx.restore();
}
