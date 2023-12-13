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
    <div id='controls' className={configOpened ? 'max' : 'min'}>
      <button id='icon-sliders' className={configTab===ConfigTab.SETTINGS ? 'selected' : ''} onClick={_=>setConfigTab(ConfigTab.SETTINGS)}>
        <FontAwesomeIcon icon={faSliders} size='2x' color={configTab===ConfigTab.SETTINGS ? '#ddd' : '#666'}/>
      </button>
      <button id='icon-lightbulb' className={configTab===ConfigTab.PRESETS ? 'selected' : ''} onClick={_=>setConfigTab(ConfigTab.PRESETS)}>
        <FontAwesomeIcon icon={faLightbulb} size='2x' color={configTab===ConfigTab.PRESETS ? '#ddd' : '#666'}/>
      </button>
      <button id='icon-pencil' className={configTab===ConfigTab.EXPRESSION ? 'selected' : ''} onClick={_=>setConfigTab(ConfigTab.EXPRESSION)}>
        <FontAwesomeIcon icon={faPencil} size='2x' color={configTab===ConfigTab.EXPRESSION ? '#ddd' : '#666'}/>
      </button>
      <button id='icon-gear' onClick={_=>setConfigOpened(c=>!c)}>
        <FontAwesomeIcon icon={faGear} size='2x' color="#ddd"/>
      </button>
      <ControlsContent selected={configTab} core={core}/>
    </div>
  );
}