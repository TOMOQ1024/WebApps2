import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";import { useEffect, useState } from "react";
import { ControlsTab } from "../Definitions";
import DRCore from "../DiceRollCore";
import ControlsButtonWrapper from "./ControlsButtonWrapper";
import ControlsContent from "./ControlsContent";

export default function Controls({core}: {
  core: DRCore;
}) {
  const [configOpened, setControlsOpened] = useState(true);
  const [controlsTab, setControlsTab] = useState<ControlsTab>(ControlsTab.EXPRESSION);

  useEffect(()=>{
    const cs = document.getElementById('controls');
    if(!cs){
      console.error('failed to get controls element');
      return;
    }

    const antiPropagation = (e: Event) => {
      e.stopPropagation();
    }

    cs.addEventListener('keydown', antiPropagation);
    cs.addEventListener('mousedown', antiPropagation);
    cs.addEventListener('mousemove', antiPropagation);
    cs.addEventListener('mouseup', antiPropagation);
    cs.addEventListener('touchstart', antiPropagation);
    cs.addEventListener('touchmove', antiPropagation);
    cs.addEventListener('touchend', antiPropagation);

    return () => {
      cs.removeEventListener('keydown', antiPropagation);
      cs.removeEventListener('mousedown', antiPropagation);
      cs.removeEventListener('mousemove', antiPropagation);
      cs.removeEventListener('mouseup', antiPropagation);
      cs.removeEventListener('touchstart', antiPropagation);
      cs.removeEventListener('touchmove', antiPropagation);
      cs.removeEventListener('touchend', antiPropagation);
    }
  });

  return (
    <div id='controls' className={`${configOpened ? 'max' : 'min'} valid`}>
      <div>
        <ControlsButtonWrapper controlsTab={controlsTab} setControlsTab={setControlsTab} core={core}/>
        <button id='button-controls' aria-label='操作メニューの表示を切り替える' onClick={_=>setControlsOpened(c=>!c)}>
          <FontAwesomeIcon icon={faGear} size='2x' color="#ddd"/>
        </button>
      </div>
      <ControlsContent selected={controlsTab} core={core}/>
    </div>
  );
}