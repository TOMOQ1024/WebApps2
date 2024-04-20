import Core from "../../../Core";
import { ControlsTab } from "../../../Definitions"
import Palette from "./Palette";

export default function ControlsContent({selected, core}: {
  selected: ControlsTab;
  core: Core | undefined;
}) {
  return (
    <div id='controls-content' className={`cc-s${selected}`}>
      {/* 詳細設定 */}
      <Palette core={core}/>
    </div>
  )
}
