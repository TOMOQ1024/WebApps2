import Core from "../../../src/Core";
import { ControlsTab } from "../../../src/Definitions"
import Palette from "./Palette";
import RunnerButtons from "./Runner";
import ToolSelector from "./ToolSelector";

export default function ControlsContent({selected, core}: {
  selected: ControlsTab;
  core: Core | undefined;
}) {
  return (
    <div id='controls-content' className={`cc-s${selected}`}>
      <Palette core={core} />
      <ToolSelector core={core} />
      <RunnerButtons core={core} />
    </div>
  )
}
