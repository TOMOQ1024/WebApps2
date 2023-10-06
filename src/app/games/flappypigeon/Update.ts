import { GRAVITY, GRIDSIZE, SCENETRANSITION } from "./Constants";
import { Game } from "./Game";

export default function Update(game: Game) {
  let {timer, sceneMgr, nessyMgr, player, keys} = game;
  const now = performance.now();
  game.dt = now - game.now;
  game.now = now;
  switch(sceneMgr.current){
    case 'title_in':
      if(timer.isEnded()) sceneMgr.next();
      break;
    case 'title':
      if(Object.entries(keys).filter(([k,t])=>t===2&&k!=='_m_mouse').length){
        timer.setDuration(SCENETRANSITION);
        sceneMgr.next();
      }
      break;
    case 'title_out':
      if(timer.isEnded()){
        timer.setDuration(SCENETRANSITION);
        game.init();
        sceneMgr.next();
        break;
      }
      break;
    case 'game_in':
      if(timer.isEnded()){
        sceneMgr.next();
        break;
      }
    case 'game':
      // if(timer.isEnded()){
      //   // timer += game.nessyMgrInterval;
      // }
      
      player.update();
      nessyMgr.update();
      break;
    case 'game_out':
      sceneMgr.next();
    case 'result_in':
      // timer = 0;
      sceneMgr.next();
      break;
    case 'result':
      // timer = Math.min(timer+0.03, 1);
      player.update();
      nessyMgr.update();
      if(keys.r === 2){
        timer.setDuration(SCENETRANSITION);
        sceneMgr.next();
      }
      break;
    case 'result_out':
      if(timer.isEnded()){
        timer.setDuration(SCENETRANSITION);
        sceneMgr.next();
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
