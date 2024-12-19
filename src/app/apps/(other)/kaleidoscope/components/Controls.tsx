import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { Box, Button, IconButton, Stack, Tab } from "@mui/material";
import {
  faGear,
  faPencil,
  faLightbulb,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import FASvgIcon from "@/components/FASvgIcon";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Core from "../Core";
import LabelEditor from "./LabelEditor";

enum ControlsTab {
  EXPRESSION,
  PRESETS,
  SETTINGS,
}

export default function Controls({ core }: { core: Core | undefined }) {
  const [controlsOpened, setControlsOpened] = useState(true);
  const [controlsTab, setControlsTab] = useState<ControlsTab>(
    ControlsTab.EXPRESSION
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!core) return;
    // core._setError = setError;
  }, [core]);

  const handleChange = (e: SyntheticEvent, n: string) => {
    setControlsTab(+n);
  };

  return (
    <Stack
      direction="row"
      className={`controls ${controlsOpened ? "max" : "min"} ${
        error ? "invalid" : "valid"
      }`}
    >
      <TabContext value={`${controlsTab}`}>
        <TabList
          orientation="vertical"
          TabIndicatorProps={{
            style: {
              left: 4,
              width: 4,
              borderRadius: 2,
            },
          }}
          onChange={handleChange}
          sx={{ width: 50 }}
        >
          <Tab
            sx={{ minWidth: 0 }}
            icon={<FASvgIcon icon={faPencil} />}
            value="0"
          />
          {/* <Tab
            sx={{ minWidth: 0 }}
            icon={<FASvgIcon icon={faLightbulb} />}
            value="1"
          />
          <Tab
            sx={{ minWidth: 0 }}
            icon={<FASvgIcon icon={faSliders} />}
            value="2"
          /> */}
        </TabList>
        {[0, 1, 2].map((i) => (
          <TabPanel value={`${i}`} key={i} sx={{ padding: 1 }}>
            {[<LabelEditor key={0} core={core} />][i]}
          </TabPanel>
        ))}
      </TabContext>
    </Stack>
  );
}
