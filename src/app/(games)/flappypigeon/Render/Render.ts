import { Game } from "../Game";
import { Params } from "../Params";
import DrawHowto from "./DrawHowto";
import DrawImgAt from "./DrawImgAt";
import DrawMenu from "./DrawMenu";
import DrawResult from "./DrawResult";
import DrawTitle from "./DrawTitle";

export default function Render(game: Game){
  let {ctx, timer, sceneMgr, nessyMgr, player} = game;

  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#eee';

  const l = Params.CANVASWIDTH/Params.GRIDSIZE;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#acf';
  ctx.fillRect(0, 0, Params.CANVASWIDTH, Params.CANVASHEIGHT);
  ctx.restore();
  // background
  if(sceneMgr.match('howto')){
    ctx.save();
    ctx.globalAlpha = .2;
    ctx.fillStyle = '#acf';
    DrawImgAt(game, 'tn', (Params.GRIDSIZE-1)/2, (Params.GRIDSIZE-1)/2, 0, Params.CANVASWIDTH/1024*Params.GRIDSIZE);
    ctx.restore();
  }

  ctx.textAlign = 'center';

  switch(sceneMgr.current){
    case 'title_in':
      ctx.globalAlpha = timer.getProgress();
      DrawTitle(game);
      break;
    case 'title_out':
      ctx.globalAlpha = timer.getRemainingProgress();
      DrawTitle(game);
      break;
    case 'title':
      DrawTitle(game);
      break;
    case 'howto_in':
      ctx.globalAlpha = timer.getProgress();
      DrawHowto(game);
      break;
    case 'howto':
      DrawHowto(game);
      break;
    case 'howto_out':
      ctx.globalAlpha = timer.getRemainingProgress();
      DrawHowto(game);
      break;
    case 'game_resume_in':
      ctx.globalAlpha = timer.getRemainingProgress();
      nessyMgr.render();
      player.render();
      DrawMenu(game);
      break;
    case 'game_resume_out':
    case 'game_in':
      ctx.globalAlpha = timer.getProgress();
      nessyMgr.render();
      player.render();
      DrawMenu(game);
      break;
    case 'game':
      nessyMgr.render();
      player.render();
      DrawMenu(game);
      break;
    case 'game_out': break;
    case 'result_out':
      ctx.globalAlpha = timer.getRemainingProgress();
    case 'result_in':
    case 'result':
      nessyMgr.render();
      player.render();
      DrawMenu(game);
      DrawResult(game);
      break;
  }
}
