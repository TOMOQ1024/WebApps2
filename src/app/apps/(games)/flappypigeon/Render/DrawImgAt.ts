import { Game } from "../Game";
import { Params } from "../Params";

export default function DrawImgAt(game: Game, imgName: string, x: number, y: number, angle=0, scale=1){
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