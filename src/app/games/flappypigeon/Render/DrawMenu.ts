import { Game } from "../Game";
import { Params } from "../Params";

export default function drawMenu(game: Game){
  let { ctx, player } = game;
  const l = Params.CANVASWIDTH / Params.GRIDSIZE;

  ctx.save();
  if(Params.KITFES){
    // クリップ
    ctx.save();
    ctx.beginPath();
    ctx.arc(l*.75, l*.75, l*8, Math.PI*2, 0, true);
    ctx.arc(l*.75, l*.75, l*.52, Math.PI*2, 0);
    ctx.arc(l*.75, l*.75, l*.5, 0, Math.PI*2, true);
    ctx.arc(l*.75, l*.75, l*.4, Math.PI*2, 0);
    ctx.arc(l*.75, l*.75, l*.38, 0, Math.PI*2, true);
    ctx.clip();
    
    // 要素背景
    ctx.fillStyle = '#334';
    ctx.fillRect(l, l/2, l*42/10, l/2);
    ctx.beginPath();
    ctx.arc(l*.75, l*.75, l*.5, 0, Math.PI*2);
    ctx.fill();

    // ミニマップ
    const NB = Params.NESSYINTERVAL * Params.BORDER;
    ctx.fillStyle = '#fff';
    ctx.save();
    ctx.translate(l*13/10, l*3/4);
    ctx.scale(l/10, l/10);
    // ゴール
    ctx.fillRect(37, -2.5, 1, 1);
    ctx.fillRect(38, -1.5, 1, 1);
    ctx.fillRect(37, -0.5, 1, 1);
    ctx.fillRect(38, +0.5, 1, 1);
    ctx.fillRect(37, +1.5, 1, 1);
    // ネッシー位置
    for(let i=1; i<Params.BORDER; i++){
      ctx.beginPath();
      ctx.arc(35/Params.BORDER*i+2, 0, .1, 0, Math.PI*2);
      ctx.fill();
    }
    // 死亡位置
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 1/2;
    let x;
    player.gravePos.forEach(g=>{
      x = Math.min(g.x/NB*35, 37);
      ctx.beginPath();
      ctx.moveTo(x-1, -1);
      ctx.lineTo(x+1, +1);
      ctx.moveTo(x-1, +1);
      ctx.lineTo(x+1, -1);
      ctx.stroke();
    });
    // プレイヤー位置
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1/5;
    x = Math.min(37, player.timer.getConsumedTime()/NB*35);
    ctx.beginPath();
    ctx.moveTo(x, -2);
    ctx.lineTo(x, +2);
    ctx.stroke();
    ctx.restore();

    // 残り時間ゲージ
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(l*.75, l*.75, l*.48, Math.min(Params.TIMELIMIT, game.mainTimer.getConsumedTime())/1000%1*Math.PI*2-Math.PI/2, -Math.PI/2);
    ctx.arc(l*.75, l*.75, l*.42, -Math.PI/2, Math.min(Params.TIMELIMIT, game.mainTimer.getConsumedTime())/1000%1*Math.PI*2-Math.PI/2, true);
    ctx.fill();
    ctx.restore();

    // 残り時間
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