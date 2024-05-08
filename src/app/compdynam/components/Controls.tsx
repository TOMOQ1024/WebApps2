import { useEffect, useState } from "react";
import ControlsContent from "./ControlsContent";
import { ControlsTab } from "../Definitions";
import Core from "../CompDynamCore";
import { Button, Stack } from "@mui/material";
import { faGear, faPencil, faLightbulb, faSliders } from "@fortawesome/free-solid-svg-icons";
import FASvgIcon from "@/components/FASvgIcon";

export default function Controls({core}: {
  core: Core;
}) {
  const [controlsOpened, setControlsOpened] = useState(true);
  const [controlsTab, setControlsTab] = useState<ControlsTab>(ControlsTab.EXPRESSION);
  const [error, setError] = useState('');

  useEffect(()=>{
    core._setError = setError;
  }, [core]);

  return (
    <Stack direction='row' id='controls' className={`${controlsOpened ? 'max' : 'min'} ${error ? 'invalid' : 'valid'}`}>
      <Stack direction='column-reverse' spacing={1} textAlign='center'>
        <Button size='small' onClick={_=>setControlsOpened(c=>!c)}>
          <FASvgIcon icon={faGear} size='xl' color="#ddd"/>
        </Button>
        <Button size='small' onClick={_=>setControlsTab(ControlsTab.EXPRESSION)}>
          <FASvgIcon icon={faPencil} size='xl' color="#ddd"/>
        </Button>
        <Button size='small' onClick={_=>setControlsTab(ControlsTab.PRESETS)}>
          <FASvgIcon icon={faLightbulb} size='xl' color="#ddd"/>
        </Button>
        <Button size='small' onClick={_=>setControlsTab(ControlsTab.SETTINGS)}>
          <FASvgIcon icon={faSliders} size='xl' color="#ddd"/>
        </Button>
      </Stack>
      <ControlsContent selected={controlsTab} core={core}/>
    </Stack>
  );
}