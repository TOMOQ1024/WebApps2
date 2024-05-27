import { SyntheticEvent, useEffect, useState } from "react";
import { ControlsTab } from "../Definitions";
import Core from "../Core";
import { Stack, Tab } from "@mui/material";
import { faPencil, faLightbulb, faSliders } from "@fortawesome/free-solid-svg-icons";
import FASvgIcon from "@/components/FASvgIcon";
import FuncEditor from "./FuncEditor";
import Settings from "./Settings";
import { TabContext, TabList, TabPanel } from "@mui/lab";

export default function Controls({core}: {
  core: Core;
}) {
  const [controlsOpened, setControlsOpened] = useState(true);
  const [controlsTab, setControlsTab] = useState<ControlsTab>(ControlsTab.EXPRESSION);
  const [error, setError] = useState('');

  useEffect(()=>{
    core._setError = setError;
  }, [core]);

  const handleChange = (e: SyntheticEvent, n: string) => {
    setControlsTab(+n);
  }

  return (
    <Stack direction='row' className={`controls ${controlsOpened ? 'max' : 'min'} ${error ? 'invalid' : 'valid'}`}>
      <TabContext value={`${controlsTab}`}>
        <TabList orientation='vertical' TabIndicatorProps={{
          style: {
            left: 4,
            width: 4,
            borderRadius: 2,
          }
        }} onChange={handleChange} sx={{width:50}}>
          <Tab sx={{ minWidth:0 }} icon={<FASvgIcon icon={faPencil}/>} value='0' />
          <Tab sx={{ minWidth:0 }} icon={<FASvgIcon icon={faSliders}/>} value='2' />
        </TabList>
        {[0,1,2].map(i=>(
          <TabPanel value={`${i}`} key={i} sx={{padding: 1}}>
            {[
              <FuncEditor key={0} core={core}/>,
              <Settings key={2} core={core}/>,
            ][i]}
          </TabPanel>
        ))}
      </TabContext>
    </Stack>
  );
}