import { Game } from "../Game";
import { Params } from "../Params";
import DrawImgAt from "./DrawImgAt";

export default function DrawHowto(game: Game){
  const {ctx} = game;
  ctx.fillStyle = 'black';
  ctx.font = `${Params.CANVASHEIGHT/20}px serif`;
  ctx.fillText('上下から伸びる・に触れないように，・をゴールまで導こう！', Params.CANVASWIDTH/2, Params.CANVASHEIGHT*.3, Params.CANVASWIDTH*0.8);
  ctx.fillText(`${Params.TIMELIMIT/1000}秒のあいだなら何度でも挑戦できるよ！`, Params.CANVASWIDTH/2, Params.CANVASHEIGHT*.4, Params.CANVASWIDTH*0.8);
  DrawImgAt(game, 'nh', 2.64, 2.3, 3, .35);
  DrawImgAt(game, 'f0', 5.54, 2.3, 0, .35);
  ctx.fillText(`好きなキーで操作．初回操作と同時にタイマースタート`, Params.CANVASWIDTH/2, Params.CANVASHEIGHT*.5, Params.CANVASWIDTH*0.8);

  ctx.font = `${Params.CANVASHEIGHT/30}px serif`;
  ctx.fillText('PRESS ANY KEY →', Params.CANVASWIDTH/2, Params.CANVASHEIGHT/4*3);
  DrawImgAt(game, 'nc', Params.GRIDSIZE-2, Params.GRIDSIZE-1);
}