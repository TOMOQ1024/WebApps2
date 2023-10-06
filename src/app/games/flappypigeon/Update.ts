
import { Game } from "./Game";
import { Params } from "./Params";

export default function Update(game: Game) {
  let {timer, mainTimer, sceneMgr, nessyMgr, player, keys} = game;
  const now = performance.now();
  game.dt = now - game.now;
  game.now = now;
  // console.log(sceneMgr.current);
  switch(sceneMgr.current){
    case 'title_in':
      if(timer.isEnded()) sceneMgr.set('title');
      break;
    case 'title':
      if(Object.entries(keys).filter(([k,t])=>t===2&&k!=='_m_mouse').length){
        timer.setDuration(Params.SCENETRANSITION);
        sceneMgr.set('title_out');
      }
      break;
    case 'title_out':
      if(timer.isEnded()){
        timer.setDuration(Params.SCENETRANSITION);
        sceneMgr.set(Params.KITFES ? 'howto_in' : 'game_in');
      }
      break;
    case 'howto_in':
      if(timer.isEnded()){
        timer.setDuration(Params.SCENETRANSITION);
        sceneMgr.set('howto');
      }
      break;
    case 'howto':
      if(Object.entries(keys).filter(([k,t])=>t===2&&k!=='_m_mouse').length){
        timer.setDuration(Params.SCENETRANSITION);
        sceneMgr.set('howto_out');
      }
      break;
    case 'howto_out':
      if(timer.isEnded()){
        timer.setDuration(Params.SCENETRANSITION);
        game.init();
        if(Params.KITFES){
          mainTimer.setDuration(Params.TIMELIMIT);
          mainTimer.pause();
        }
        sceneMgr.set('game_in');
      }
      break;
    case 'game_in':
      if(timer.isEnded()){
        sceneMgr.set('game');
        break;
      }
    case 'game_resume_in':
      if(timer.isEnded()){
        nessyMgr.init();
        player.init();
        game.interact = false;
        game.score = 0;
        timer.setDuration(Params.SCENETRANSITION);
        sceneMgr.set('game_resume_out');
      }
      player.update();
      nessyMgr.update();
      break;
    case 'game_resume_out':
      if(timer.isEnded()){
        sceneMgr.set('game');
      }
      player.update();
      nessyMgr.update();
      break;
    case 'game':
      if(Params.KITFES && game.mainTimer.isEnded()){
        player.collided = true;
        timer.setDuration(Params.SCENETRANSITION);
        sceneMgr.set('game_out');
      }
      player.update();
      nessyMgr.update();
      break;
    case 'game_out':
      sceneMgr.set('result_in');
    case 'result_in':
      sceneMgr.set('result');
      break;
    case 'result':
      // timer = Math.min(timer+0.03, 1);
      player.update();
      nessyMgr.update();
      if(keys.r === 2 && timer.isEnded()){
        timer.setDuration(Params.KEYHOLDTIME * 2);
      }
      if(timer.isRunning() && keys.r === 0){
        timer.end();
      }
      if(timer.isRunning() && Params.KEYHOLDTIME < timer.getConsumedTime()){
        timer.setDuration(Params.SCENETRANSITION);
        sceneMgr.set('result_out');
      }
      break;
    case 'result_out':
      if(timer.isEnded()){
        timer.setDuration(Params.SCENETRANSITION);
        sceneMgr.set('title_in');
      }
      break;
  }

  // キー状態の更新
  for(let key in keys){
    if(keys[key] === 2){
      keys[key] = 1;
    }
  }
}
