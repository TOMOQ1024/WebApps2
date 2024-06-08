import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPencil, faLightbulb, faSliders } from "@fortawesome/free-solid-svg-icons";
import { Dispatch, SetStateAction } from "react";
import { ControlsTab } from "../../src/Definitions";

export default function ControlsNav({controlsTab, setControlsTab, setControlsOpened}: {
  controlsTab: ControlsTab;
  setControlsTab: Dispatch<SetStateAction<ControlsTab>>;
  setControlsOpened: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div id='controls-nav' className={`cc-s${controlsTab}`}>
    </div>
  )
}
