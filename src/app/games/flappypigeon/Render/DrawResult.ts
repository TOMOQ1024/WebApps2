import { Game } from "../Game";
import { Params } from "../Params";

export default function DrawResult(game: Game){
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