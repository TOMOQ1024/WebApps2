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
          解像度
        </Typography>
        <Slider
          defaultValue={Math.log10(core.app.renderer?.resolution ?? 1)}
          min={-3}
          max={+1}
          step={0.1}
          sx={{
            width: 250
          }}
          valueLabelDisplay="auto"
          valueLabelFormat={(v,i)=>(
            <>1E{v}</>
          )}
          aria-label="Volume"
          onChange={(_, n)=>{
            core.setRF(10**(n as number));
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