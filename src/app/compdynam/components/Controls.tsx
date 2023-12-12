'use client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPencil, faLightbulb, faSliders } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import ControlsContent from "./ControlsContent";
import { ConfigTab } from "../Definitions";



export default function Controls() {
  const [configOpened, setConfigOpened] = useState(true);
  const [configTab, setConfigTab] = useState<ConfigTab>(ConfigTab.EXPRESSION);
  const toggleConfig = (e: MouseEvent) => {
    setConfigOpened(c=>!c);
  }
  return (
    <div id='controls' className={configOpened ? 'max' : 'min'}>
      <button id='icon-sliders' className={configTab===ConfigTab.SETTINGS ? 'selected' : ''} onClick={e=>setConfigTab(ConfigTab.SETTINGS)}>
        <FontAwesomeIcon icon={faSliders} size='2x' color={configTab===ConfigTab.SETTINGS ? '#ddd' : '#666'}/>
      </button>
      <button id='icon-lightbulb' className={configTab===ConfigTab.PRESETS ? 'selected' : ''} onClick={e=>setConfigTab(ConfigTab.PRESETS)}>
        <FontAwesomeIcon icon={faLightbulb} size='2x' color={configTab===ConfigTab.PRESETS ? '#ddd' : '#666'}/>
      </button>
      <button id='icon-pencil' className={configTab===ConfigTab.EXPRESSION ? 'selected' : ''} onClick={e=>setConfigTab(ConfigTab.EXPRESSION)}>
        <FontAwesomeIcon icon={faPencil} size='2x' color={configTab===ConfigTab.EXPRESSION ? '#ddd' : '#666'}/>
      </button>
      <button id='icon-gear' onClick={e=>toggleConfig(e as unknown as MouseEvent)}>
        <FontAwesomeIcon icon={faGear} size='2x' color="#ddd"/>
      </button>
      <ControlsContent selected={configTab}/>
    </div>
  );
}