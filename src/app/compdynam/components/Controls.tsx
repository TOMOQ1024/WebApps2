import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPencil, faLightbulb, faSliders } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import ControlsContent from "./ControlsContent";
import { ConfigTab } from "../Definitions";
import CDCore from "../CompDynamCore";

export default function Controls({core}: {
  core: CDCore;
}) {
  const [configOpened, setConfigOpened] = useState(true);
  const [configTab, setConfigTab] = useState<ConfigTab>(ConfigTab.EXPRESSION);

  useEffect(()=>{
    const cs = document.getElementById('controls');
    if(!cs){
      console.error('failed to get controls element');
      return;
    }

    const antiPropagation = (e: MouseEvent) => {
      e.stopPropagation();
    }

    cs.addEventListener('mousedown', antiPropagation);
    cs.addEventListener('mousemove', antiPropagation);
    cs.addEventListener('mouseup', antiPropagation);

    return () => {
      cs.removeEventListener('mousedown', antiPropagation);
      cs.removeEventListener('mousemove', antiPropagation);
      cs.removeEventListener('mouseup', antiPropagation);
    }
  });

  return (
    <div id='controls' className={`${configOpened ? 'max' : 'min'} valid`}>
      <button id='button-settings' className={configTab===ConfigTab.SETTINGS ? 'selected' : ''} aria-label='詳細設定を開く' onClick={_=>setConfigTab(ConfigTab.SETTINGS)}>
        <FontAwesomeIcon icon={faSliders} size='2x' color={configTab===ConfigTab.SETTINGS ? '#ddd' : '#666'}/>
      </button>
      <button id='button-presets' className={configTab===ConfigTab.PRESETS ? 'selected' : ''} aria-label='プリセット選択を開く' onClick={_=>setConfigTab(ConfigTab.PRESETS)}>
        <FontAwesomeIcon icon={faLightbulb} size='2x' color={configTab===ConfigTab.PRESETS ? '#ddd' : '#666'}/>
      </button>
      <button id='button-expression' className={configTab===ConfigTab.EXPRESSION ? 'selected' : ''} aria-label='数式編集を開く' onClick={_=>setConfigTab(ConfigTab.EXPRESSION)}>
        <FontAwesomeIcon icon={faPencil} size='2x' color={configTab===ConfigTab.EXPRESSION ? '#ddd' : '#666'}/>
      </button>
      <button id='button-controls' aria-label='操作メニューの表示を切り替える' onClick={_=>setConfigOpened(c=>!c)}>
        <FontAwesomeIcon icon={faGear} size='2x' color="#ddd"/>
      </button>
      <ControlsContent selected={configTab} core={core}/>
    </div>
  );
}