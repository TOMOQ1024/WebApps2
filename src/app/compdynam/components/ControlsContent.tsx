import Core from "../CompDynamCore";
import { ControlsTab } from "../Definitions"
import FuncEditor from "./FuncEditor";
import PresetSelector from "./PresetSelector";
import Settings from "./Settings";

export default function ControlsContent({selected, core}: {
  selected: ControlsTab;
  core: Core;
}) {
  return (
    <div id='controls-content' className={`cc-s${selected}`}>
      {/* 詳細設定 */}
      <Settings core={core}/>
      {/* プリセット選択 */}
      <PresetSelector core={core}/>
      {/* 数式編集 */}
      <FuncEditor core={core}/>
    </div>
  )
}
