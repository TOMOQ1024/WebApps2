import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPencil, faLightbulb, faSliders } from "@fortawesome/free-solid-svg-icons";
import { ControlsTab } from "../Definitions"
import { Dispatch, SetStateAction } from "react";

export default function ControlsNav({controlsTab, setControlsTab, setControlsOpened}: {
  controlsTab: ControlsTab;
  setControlsTab: Dispatch<SetStateAction<ControlsTab>>;
  setControlsOpened: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div id='controls-nav' className={`cc-s${controlsTab}`}>
      <button id='button-controls' aria-label='操作メニューの表示を切り替える' onClick={_=>setControlsOpened(c=>!c)}>
        <FontAwesomeIcon icon={faGear} size='2x' color="#ddd"/>
      </button>
      <button id='button-expression' className={controlsTab===ControlsTab.EXPRESSION ? 'selected' : ''} aria-label='数式編集を開く' onClick={_=>setControlsTab(ControlsTab.EXPRESSION)}>
        <FontAwesomeIcon icon={faPencil} size='2x' color={controlsTab===ControlsTab.EXPRESSION ? '#ddd' : '#666'}/>
      </button>
      <button id='button-presets' className={controlsTab===ControlsTab.PRESETS ? 'selected' : ''} aria-label='プリセット選択を開く' onClick={_=>setControlsTab(ControlsTab.PRESETS)}>
        <FontAwesomeIcon icon={faLightbulb} size='2x' color={controlsTab===ControlsTab.PRESETS ? '#ddd' : '#666'}/>
      </button>
      <button id='button-settings' className={controlsTab===ControlsTab.SETTINGS ? 'selected' : ''} aria-label='詳細設定を開く' onClick={_=>setControlsTab(ControlsTab.SETTINGS)}>
        <FontAwesomeIcon icon={faSliders} size='2x' color={controlsTab===ControlsTab.SETTINGS ? '#ddd' : '#666'}/>
      </button>
    </div>
  )
}
