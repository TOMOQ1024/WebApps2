import { Game } from "../Game";
import { Params } from "../Params";
import DrawMenu from "./DrawMenu";
import DrawResult from "./DrawResult";
import DrawTitle from "./DrawTitle";

export default function Render(game: Game){
  let {ctx, timer, sceneMgr, nessyMgr, player} = game;

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
      DrawTitle(game);
      break;
    case 'title_out':
      ctx.globalAlpha = timer.getRemainingProgress();
      DrawTitle(game);
      break;
    case 'title':
      DrawTitle(game);
      break;
    case 'game_in':
      ctx.globalAlpha = timer.getProgress();
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
