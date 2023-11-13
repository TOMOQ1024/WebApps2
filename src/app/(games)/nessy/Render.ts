import { Game } from "./Game";
import a2dp from "./Utils";

export default function Render(game: Game){
  game.ctx.globalAlpha = 1.0;
  game.ctx.fillStyle = '#eee';

  // background
  const l = game.cvs.width/game.width;
  game.ctx.save();
  game.ctx.globalAlpha = 1;
  for(let y=0; y<game.width; y++){
    for(let x=0; x<game.width; x++){
      game.ctx.drawImage(game.imgs.bg, x*l, y*l, l, l);
      // game.ctx.drawImage(game.imgs.mc, x*l, y*l, l, l);
      // game.drawImgAt(['fc','ns','nb','sh'][(x+y)%4],x,y);
    }
  }
  game.ctx.restore();

  game.ctx.textAlign = 'center';

  switch(game.scene){
    case '->title':
    case 'title->':
      game.ctx.globalAlpha = 1 - game.timer;
    case 'title':
      game.ctx.save();
      game.ctx.globalAlpha = 0.03;
      drawImgAt(game, 'fc', (game.width-1)/2, (game.width-1)/2, 3, game.width);
      game.ctx.restore();
      game.ctx.fillStyle = 'black';
      game.ctx.font = `${game.cvs.height/6}px serif`;
      game.ctx.fillText('Nessy', game.cvs.width/2, game.cvs.height/2.5);
      game.ctx.font = `${game.cvs.height/30}px serif`;
      game.ctx.fillText('PRESS ANY KEY TO START', game.cvs.width/2, game.cvs.height/4*3);
      break;
    case '->game':
      break;
    case 'game':
      drawEmojis(game);
      drawPlayer(game);
      drawSLabels(game);
      drawMenu(game);
      break;
    // case 'game->':
    //   break;
    case 'result->':
      game.ctx.globalAlpha = game.timer;
    case 'result':
      drawEmojis(game);
      drawPlayer(game);
      drawSLabels(game);
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
      drawImgAt(game, 'np', 2, game.width/2-0.5, 0, 2);
      game.ctx.textAlign = 'left';
      game.ctx.fillText(':', game.cvs.width*0.3, game.cvs.height*0.5);
      game.ctx.fillText(`${Math.floor(game.score.current)}`, game.cvs.width*0.4, game.cvs.height*0.5);
      game.ctx.font = `${game.cvs.height/12}px serif`;
      game.ctx.textAlign = 'center';
      game.ctx.fillText(`Press R to Title`, game.cvs.width/2, game.cvs.height*0.7);
      break;
    // case 'result->':
    //   break;
  }
}

function drawPlayer(game: Game){
  let pos = {...game.player.origin};
  let dps = {x:0, y:0};
  let pdr = 0;
  let dir = 2;
  let ndr = game.player.path[1] || dir;
  drawImgAt(game, 'sh', pos.x, pos.y, dir);
  for(let i=1; i<game.player.path.length; i++){
    pdr = dir;
    dir = ndr;
    dps = a2dp(dir);
    pos.x = pos.x+dps.x;
    pos.y = pos.y+dps.y;
    // pos.x = ((pos.x+dps.x)%game.width + game.width) % game.width;
    // pos.y = ((pos.y+dps.y)%game.width + game.width) % game.width;
    ndr = game.player.path[i+1] || 0;
    if(i === game.player.path.length-1){
      drawImgAt(game,'fc', pos.x, pos.y, dir);
      if(false){
        drawImgAt(game, 'pc', pos.x+a2dp(dir-1).x, pos.y+a2dp(dir-1).y, dir+1);
        drawImgAt(game, 'pc', pos.x+a2dp(dir+1).x, pos.y+a2dp(dir+1).y, dir+1);
      }
    }
    else if((ndr-dir) % 2 === 0) {
      drawImgAt(game, 'ns', pos.x, pos.y, dir);
    }
    else if(((ndr-dir) % 4 + 4) % 4 === 1) {
      drawImgAt(game, 'nb', pos.x, pos.y, dir);
    }
    else {
      drawImgAt(game, 'nb', pos.x, pos.y, dir+1);
    }
  }
}

function drawEmojis(game: Game){
  let e: typeof game.emojis[number];

  for(let i=0; i<game.emojis.length; i++){
    e = game.emojis[i];
    drawImgAt(game, e.n, e.x, e.y, 0.1*Math.sin((performance.now()-e.b)/100), 0.45 + 0.05*Math.sin((performance.now()-e.b)/300));
  }
}

function drawSLabels(game: Game){
  const l = game.cvs.width / game.width;
  let s: typeof game.slabels[number];

  game.ctx.save();
  game.ctx.fillStyle = 'yellow';
  game.ctx.textAlign = 'center';
  game.ctx.shadowBlur = l/10;
  game.ctx.shadowColor = 'black';
  game.ctx.font = `${l/3+game.score.streaks}px serif`;
  for(let i=0; i<game.slabels.length; i++){
    s = game.slabels[i];
    game.ctx.fillText(`+${s.score}`, l*s.x, l*s.y - Math.sqrt((performance.now()-s.since)/1000)*l);
  }
  game.ctx.restore();
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

  // タイマー
  if(game.scene === 'game'){
    game.ctx.save();
    game.ctx.translate(l*2.5, l*0.5);
    game.ctx.beginPath();
    game.ctx.moveTo(0, 0);
    game.ctx.arc(0, 0, l*10, -Math.PI/2, Math.PI*(-0.5+2*(1-game.timer/game.playtime)), true);
    game.ctx.closePath();
    game.ctx.clip();
    game.ctx.lineWidth = l/9;
    game.ctx.strokeStyle = '#0f0';
    game.ctx.strokeRect(-l*2.5+l/14, -l*0.5+l/14, l*5-l/7, l-l/7);
    game.ctx.restore();
  }

  // スコア表示
  game.ctx.save();
  game.ctx.fillStyle = '#44444444';
  game.ctx.fillRect(l/7, l/7, l*33/7, l*5/7);
  game.ctx.strokeStyle = '#444';
  game.ctx.lineWidth = 3;
  // game.ctx.strokeRect(l/7, l/7, l*33/7, l*5/7);
  game.ctx.fillStyle = '#ffffff';
  game.ctx.font = `${l/2}px serif`;
  game.ctx.textAlign = 'left';
  game.ctx.textBaseline = 'middle';
  game.ctx.drawImage(game.imgs.np, l*0.25, l*0.25, l*0.5, l*0.5);
  // game.ctx.fillText(`:`, l*0.8, l*0.5);

  // streak indicator
  let m = game.ctx.measureText(`${Math.floor(game.score.current)}`);
  if(game.score.streaks && dc < game.score.mdc){
    game.ctx.fillStyle = '#ffff00';
    game.ctx.font = `${l/3}px serif`;
    game.ctx.fillText(`(${game.score.streaks+1}x)`, l*1.1+m.width, l*0.5);
    game.ctx.save();
    game.ctx.translate(l+m.width/2, l*0.5);
    game.ctx.beginPath();
    game.ctx.moveTo(0, 0);
    game.ctx.arc(0, 0, l*5, Math.PI/2, Math.PI*(0.5+2*(1-dc/game.score.mdc)));
    game.ctx.closePath();
    game.ctx.clip();
    game.ctx.fillStyle = '#ffff0040';
    game.ctx.fillRect(-l*0.05-m.width/2, -l*0.25, l*0.1+m.width, l*0.5);
    game.ctx.lineWidth = l/50;
    game.ctx.strokeStyle = '#ffff00';
    game.ctx.strokeRect(-l*0.05-m.width/2, -l*0.25, l*0.1+m.width, l*0.5);
    game.ctx.restore();
  }
  game.ctx.font = `${l/2}px serif`;
  game.ctx.shadowBlur = l/20;
  game.ctx.shadowColor = 'black';
  game.ctx.fillStyle = '#ffffff';
  game.ctx.fillText(`${Math.floor(game.score.current)} `, l, l*0.5);

  game.ctx.restore();
}
