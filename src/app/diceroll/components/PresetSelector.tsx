import { useEffect, useRef } from "react";
import { PresetRolls } from "../Definitions";
import DRCore from "../DiceRollCore";

export default function PresetSelector({core}: {
  core: DRCore;
}) {
  const ref = useRef<HTMLElement>(null);

  function HandleClick(i: number){
    const R = PresetRolls[i];
    core.diceMgr.roll(R[0], R[1]);
  }
  
  return (
    <div id='preset-selector'>
      <div>- プリセット選択 -</div>
      <div id='preset-button-wrapper'>
        {
          PresetRolls.map((v,i)=>{
            return (
              <button
              className='preset-button'
              key={v.map(n=>String(n)).join('-')}
              type='button'
              onClick={()=>HandleClick(i)}
              >{`${v[0]}d${v[1]}`}</button>
            );
          })
        }
      </div>
    </div>
  )
}
