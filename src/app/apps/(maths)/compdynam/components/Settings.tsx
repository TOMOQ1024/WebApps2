import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import Core from "../Core";

export default function Settings({ core }: { core: Core | undefined }) {
  return (
    <Stack direction="column">
      <Typography textAlign="center">- 描画設定 -</Typography>
      <Stack direction="row" spacing={1}>
        <Typography my="auto">解像度</Typography>
        <Slider
          defaultValue={Math.log10(core?.resolutionFactor ?? 1)}
          min={-3}
          max={+1}
          step={0.1}
          sx={{
            width: 190,
          }}
          valueLabelDisplay="auto"
          valueLabelFormat={(v: any, i: any) => <>1E{v}</>}
          aria-label="Volume"
          onChange={(_: any, n: any) => {
            if (!core) return;
            core.resolutionFactor = 10 ** (n as number);
          }}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my="auto">描画モード</Typography>
        <FormControl>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            onChange={(e) => {
              if (!core) return;
              core.renderingMode =
                e.target.value === "hsv" ? "hsv" : "grayscale";
            }}
          >
            <FormControlLabel
              value="hsv"
              control={<Radio />}
              label="HSV"
              defaultChecked
            />
            <FormControlLabel
              value="grayscale"
              control={<Radio />}
              label="Grayscale"
            />
          </RadioGroup>
        </FormControl>
      </Stack>
    </Stack>
  );
}
