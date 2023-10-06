import { Game } from "../Game";
import { Params } from "../Params";

export default function drawMenu(game: Game){
  let { ctx } = game;
  const l = Params.CANVASWIDTH / Params.GRIDSIZE;

  ctx.save();
  if(Params.KITFES){
    // 残り時間表示


    ctx.save();
    ctx.beginPath();
    ctx.arc(l*.75, l*.75, l*8, Math.PI*2, 0, true);
    ctx.arc(l*.75, l*.75, l*.52, Math.PI*2, 0);
    ctx.arc(l*.75, l*.75, l*.5, 0, Math.PI*2, true);
    ctx.arc(l*.75, l*.75, l*.4, Math.PI*2, 0);
    ctx.arc(l*.75, l*.75, l*.38, 0, Math.PI*2, true);
    ctx.clip();
    
    ctx.fillStyle = '#334';
    ctx.fillRect(l, l/2, l*3, l/2);
    
    ctx.beginPath();
    ctx.arc(l*.75, l*.75, l*.5, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(l*.75, l*.75, l*.48, Math.min(Params.TIMELIMIT, game.mainTimer.getConsumedTime())/1000%1*Math.PI*2-Math.PI/2, -Math.PI/2);
    ctx.arc(l*.75, l*.75, l*.42, -Math.PI/2, Math.min(Params.TIMELIMIT, game.mainTimer.getConsumedTime())/1000%1*Math.PI*2-Math.PI/2, true);
    ctx.fill();
    ctx.restore();


    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${l*.5}px serif`;
    ctx.fillText(`${
      Math.max(
        0,
        Math.ceil(game.mainTimer.getRemainingTime()/1000)
      ).toString()
    }`, l*.75, l*.75);
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