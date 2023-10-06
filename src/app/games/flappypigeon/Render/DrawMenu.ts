import { Game } from "../Game";
import { Params } from "../Params";

export default function drawMenu(game: Game){
  let {cvs, ctx} = game;
  const l = cvs.width / Params.GRIDSIZE;

  ctx.save();
  if(Params.KITFES){
    // 残り時間表示
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `${l}px serif`;
    ctx.fillText(`${
      Math.max(
        0,
        Math.ceil(game.mainTimer.getRemainingTime()/1000)
      ).toString().padStart(2,' ')
    }`, l/3, l/3);
  }
  else{
    // スコア表示
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `${l}px serif`;
    ctx.fillText(`${game.score}`, l/2, l/2);
  }
  ctx.restore();

}