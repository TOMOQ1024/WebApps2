import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faLightbulb, faSliders } from "@fortawesome/free-solid-svg-icons";
import { ControlsTab } from "../Definitions";
import DRCore from "../DiceRollCore";

export default function ControlsButtonWrapper({controlsTab, setControlsTab, core}: {
  controlsTab: ControlsTab;
  setControlsTab: (arg0: ControlsTab)=>void;
  core: DRCore;
}) {
  return (
    <div className='controls-button-wrapper'>
      <button id='button-settings' className={controlsTab===ControlsTab.SETTINGS ? 'selected' : ''} aria-label='詳細設定を開く' onClick={_=>setControlsTab(ControlsTab.SETTINGS)}>
        <FontAwesomeIcon icon={faSliders} size='2x' color={controlsTab===ControlsTab.SETTINGS ? '#ddd' : '#666'}/>
      </button>
      <button id='button-presets' className={controlsTab===ControlsTab.PRESETS ? 'selected' : ''} aria-label='プリセット選択を開く' onClick={_=>setControlsTab(ControlsTab.PRESETS)}>
        <FontAwesomeIcon icon={faLightbulb} size='2x' color={controlsTab===ControlsTab.PRESETS ? '#ddd' : '#666'}/>
      </button>
      <button id='button-expression' className={controlsTab===ControlsTab.EXPRESSION ? 'selected' : ''} aria-label='数式編集を開く' onClick={_=>setControlsTab(ControlsTab.EXPRESSION)}>
        <FontAwesomeIcon icon={faPencil} size='2x' color={controlsTab===ControlsTab.EXPRESSION ? '#ddd' : '#666'}/>
      </button>
    </div>
  )
}