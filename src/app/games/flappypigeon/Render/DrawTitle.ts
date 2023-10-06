import { Game } from "../Game";
import { Params } from "../Params";
import drawImgAt from "./DrawImgAt";

export default function DrawTitle(game: Game){
  const {ctx} = game;
  ctx.fillStyle = 'black';
  ctx.font = `${Params.CANVASHEIGHT/5}px serif`;
  ctx.fillText('FlappyPigeon', Params.CANVASWIDTH/2, Params.CANVASHEIGHT/2.5, Params.CANVASWIDTH*0.8);
  ctx.font = `${Params.CANVASHEIGHT/30}px serif`;
  ctx.fillText('PRESS ANY KEY TO START', Params.CANVASWIDTH/2, Params.CANVASHEIGHT/4*3);
  drawImgAt(game, 'nc', Params.GRIDSIZE-2, Params.GRIDSIZE-1);
}