import { Game } from "../Game";
import { Params } from "../Params";

export default function drawMenu(game: Game){
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