import DRCore from "../DiceRollCore";
import { ControlsTab } from "../Definitions"
import PresetSelector from "./PresetSelector";
// import FuncEditor from "./FuncEditor";
// import PresetSelector from "./PresetSelector";
// import Settings from "./Settings";

export default function ControlsContent({selected, core}: {
  selected: ControlsTab;
  core: DRCore;
}) {
  return (
    <div id='controls-content' className={`cc-s${selected}`}>
      {/* <Settings core={core}/> */}
      <PresetSelector core={core}/>
      {/* <FuncEditor core={core}/> */}
    </div>
  )
}
