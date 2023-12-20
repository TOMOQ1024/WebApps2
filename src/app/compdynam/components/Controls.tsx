import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPencil, faLightbulb, faSliders } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import ControlsContent from "./ControlsContent";
import { ControlsTab } from "../Definitions";
import CDCore from "../CompDynamCore";

export default function Controls({core}: {
  core: CDCore;
}) {
  const [configOpened, setControlsOpened] = useState(true);
  const [configTab, setControlsTab] = useState<ControlsTab>(ControlsTab.EXPRESSION);

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
      <button id='button-settings' className={configTab===ControlsTab.SETTINGS ? 'selected' : ''} aria-label='詳細設定を開く' onClick={_=>setControlsTab(ControlsTab.SETTINGS)}>
        <FontAwesomeIcon icon={faSliders} size='2x' color={configTab===ControlsTab.SETTINGS ? '#ddd' : '#666'}/>
      </button>
      <button id='button-presets' className={configTab===ControlsTab.PRESETS ? 'selected' : ''} aria-label='プリセット選択を開く' onClick={_=>setControlsTab(ControlsTab.PRESETS)}>
        <FontAwesomeIcon icon={faLightbulb} size='2x' color={configTab===ControlsTab.PRESETS ? '#ddd' : '#666'}/>
      </button>
      <button id='button-expression' className={configTab===ControlsTab.EXPRESSION ? 'selected' : ''} aria-label='数式編集を開く' onClick={_=>setControlsTab(ControlsTab.EXPRESSION)}>
        <FontAwesomeIcon icon={faPencil} size='2x' color={configTab===ControlsTab.EXPRESSION ? '#ddd' : '#666'}/>
      </button>
      <button id='button-controls' aria-label='操作メニューの表示を切り替える' onClick={_=>setControlsOpened(c=>!c)}>
        <FontAwesomeIcon icon={faGear} size='2x' color="#ddd"/>
      </button>
      <ControlsContent selected={configTab} core={core}/>
    </div>
  );
}