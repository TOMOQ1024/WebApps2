import CDCore from "../CompDynamCore";
import { ConfigTab } from "../Definitions"
import FuncEditor from "./FuncEditor";
import PresetSelector from "./PresetSelector";

export default function ControlsContent({selected, core}: {
  selected: ConfigTab;
  core: CDCore;
}) {
  return (
    <div id='controls-content' className={`cc-s${selected}`}>
      {/* 詳細設定 */}
      <div>Under Construction...</div>
      {/* プリセット選択 */}
      <PresetSelector core={core}/>
      {/* 数式編集 */}
      <FuncEditor core={core}/>
    </div>
  )
}
