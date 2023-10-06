import { Game } from "./Game";
import { Params } from "./Params";

export default function Render(game: Game){
  let {ctx, timer, sceneMgr} = game;

  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#eee';

  // background
  const l = Params.CANVASWIDTH/Params.GRIDSIZE;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#acf';
  ctx.fillRect(0, 0, Params.CANVASWIDTH, Params.CANVASHEIGHT);
  ctx.restore();

  ctx.textAlign = 'center';

  switch(sceneMgr.current){
    case 'title_in':
      ctx.globalAlpha = timer.getProgress();
      drawTitle(game);
      break;
    case 'title_out':
      ctx.globalAlpha = timer.getRemainingProgress();
      drawTitle(game);
      break;
    case 'title':
      drawTitle(game);
      break;
    case 'game_in':
      ctx.globalAlpha = timer.getProgress();
    case 'game':
      drawNessy(game);
      drawPlayer(game);
      drawMenu(game);
      break;
    case 'game_out': break;
    case 'result_out':
      ctx.globalAlpha = timer.getRemainingProgress();
    case 'result_in':
    case 'result':
      drawNessy(game);
      drawPlayer(game);
      drawMenu(game);
      drawResult(game);
      break;
  }
}

function drawTitle(game: Game){
  const {ctx} = game;
  ctx.fillStyle = 'black';
  ctx.font = `${Params.CANVASHEIGHT/5}px serif`;
  ctx.fillText('FlappyPigeon', Params.CANVASWIDTH/2, Params.CANVASHEIGHT/2.5, Params.CANVASWIDTH*0.8);
  ctx.font = `${Params.CANVASHEIGHT/30}px serif`;
  ctx.fillText('PRESS ANY KEY TO START', Params.CANVASWIDTH/2, Params.CANVASHEIGHT/4*3);
  drawImgAt(game, 'nc', Params.GRIDSIZE-2, Params.GRIDSIZE-1);
}

function drawPlayer(game: Game){
  const { player } = game;
  const pos = player.pos;
  let dir = player.dir;
  // let dir = Math.atan2(game.player.vel.y, game.player.vel.x);
  drawImgAt(
    game,
    game.interact ?
      player.collided ? 'dd' : (dir<.03 ? 'f0' : 'f1') :
      (Math.floor(game.now/60)%2 ? 'f0' : 'f1'),
    pos.x, pos.y, dir
  );
}

let groundPos = 0;
function drawNessy(game: Game){
  const { nessyMgr, player } = game;
  const { nessies } = nessyMgr;
  const l = Params.CANVASWIDTH / Params.GRIDSIZE;
  let n: typeof nessies[number];

  // ネシ
  for(let i=0; i<nessies.length; i++){
    n = nessies[i];
    if(!n) continue;
    for(let j=-Params.GRIDSIZE; j<=Params.GRIDSIZE; j++){
      if(j*j<2) continue;
      drawImgAt(
        game,
        j*j===4 ? 'nh' : 'nn',
        n.pos.x, n.pos.y+j, Math.sign(-j), 1.05
      );
    }
  }

  // 地面
  groundPos -= player.vel.x/20;
  for(let i=-1; i<=Params.GRIDSIZE+1; i++){
    drawImgAt(
      game,
      'nn',
      i+((groundPos)%1+1)%1-1, Params.GRIDSIZE-.5, 0, 1.05
    );
  }
}

function drawImgAt(game: Game, imgName: string, x: number, y: number, angle=0, scale=1){
  let {ctx} = game;
  if(!game.imgs[imgName])return;
  const l = Params.CANVASWIDTH/Params.GRIDSIZE;
  ctx.save();
  // ctx.globalAlpha = 0.1;
  ctx.translate(x*l, y*l);
  ctx.translate(l/2, l/2);
  ctx.rotate(angle*Math.PI/2);
  ctx.scale(scale, scale);
  ctx.translate(-l/2, -l/2);
  ctx.drawImage(game.imgs[imgName], 0, 0, l, l);
  ctx.restore();
}

function drawMenu(game: Game){
  let {cvs, ctx} = game;
  const l = cvs.width / Params.GRIDSIZE;

  // スコア表示
  ctx.save();
  ctx.fillStyle = 'black';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${l}px serif`;
  ctx.fillText(`${game.score}`, l/2, l/2);

  ctx.restore();
}

function drawResult(game: Game){
  const { ctx, sceneMgr, timer } = game;
  const bgAlphaParam = sceneMgr.current === 'result_out' ? 1 : timer.getProgress();

  ctx.save();

  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff'+Math.floor(bgAlphaParam*188).toString(16).padStart(2,'0');
  ctx.fillRect(0, 0, Params.CANVASWIDTH, Params.CANVASHEIGHT);
  ctx.fillStyle = '#000000'+Math.floor(bgAlphaParam*160).toString(16).padStart(2,'0');
  ctx.fillRect(0, Params.CANVASHEIGHT*0.2, Params.CANVASWIDTH, Params.CANVASHEIGHT*0.6);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = `${Params.CANVASHEIGHT/9}px serif`;
  ctx.fillText(`Result`, Params.CANVASWIDTH/2, Params.CANVASHEIGHT*0.3);
  ctx.textAlign = 'center';
  ctx.font = `${Params.CANVASHEIGHT/6}px serif`;
  ctx.fillText(`${game.score}`, Params.CANVASWIDTH*0.5, Params.CANVASHEIGHT*0.5);
  ctx.font = `${Params.CANVASHEIGHT/17}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`PRESS R KEY TO TITLE`, Params.CANVASWIDTH/2, Params.CANVASHEIGHT*0.7);

  ctx.restore();
}
