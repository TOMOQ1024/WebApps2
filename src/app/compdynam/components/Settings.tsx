import { FormControl, FormControlLabel, Radio, RadioGroup, Slider, Stack, Typography } from "@mui/material";
import Core from "../CompDynamCore";
import { RenderingMode } from "../Definitions";
import React from "react";

export default function Settings({core}: {
  core: Core;
}) {
  return (
    <Stack direction='column' p={1}>
      <Typography>
        - 描画設定 -
      </Typography>
      <Stack direction="row" spacing={1}>
        <Typography my='auto'>
          解像度倍率
        </Typography>
        <Slider
          defaultValue={core.resFactor}
          min={-1}
          max={+1}
          step={0.01}
          // sx={{
          //   p: 5,
          // }}
          aria-label="Volume"
          onChange={(_, n)=>{
            core.setRF(n as number);
          }}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my='auto'>
          描画モード
        </Typography>
        <FormControl>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            onChange={e=>{
              core.setRM(e.target.value === 'hsv' ? RenderingMode.HSV : RenderingMode.GRAYSCALE);
              core.updateShader();
            }}
          >
            <FormControlLabel value="hsv" control={<Radio />} label="HSV" />
            <FormControlLabel value="grayscale" control={<Radio />} label="Grayscale" />
          </RadioGroup>
        </FormControl>
      </Stack>
    </Stack>
  );
}