import { useEffect, useState } from "react";
import ControlsContent from "./ControlsContent";
import { ControlsTab } from "../Definitions";
import CDCore from "../CompDynamCore";
import ControlsNav from "./ControlsNav";

export default function Controls({ core }: { core: CDCore }) {
  const [controlsOpened, setControlsOpened] = useState(true);
  const [controlsTab, setControlsTab] = useState<ControlsTab>(
    ControlsTab.EXPRESSION
  );

  useEffect(() => {
    const cs = document.getElementById("controls");
    if (!cs) {
      console.error("failed to get controls element");
      return;
    }
  });

  return (
    <div id="controls" className={`${controlsOpened ? "max" : "min"} valid`}>
      <ControlsNav
        controlsTab={controlsTab}
        setControlsTab={setControlsTab}
        setControlsOpened={setControlsOpened}
      />
      <ControlsContent selected={controlsTab} core={core} />
    </div>
  );
}
