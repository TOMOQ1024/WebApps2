import { Alert, Stack, TextField, Tooltip, Typography } from "@mui/material";
import Core from "../Core";

export default function LabelEditor({ core }: { core: Core | undefined }) {
  return (
    <Stack direction="column">
      <Typography textAlign="center">- 反復回数・鏡の配置 -</Typography>
      <Stack direction="row" spacing={1}>
        <Typography my="auto">反復回数</Typography>
        <TextField
          type="number"
          autoComplete="off"
          defaultValue={core?.iter}
          inputProps={{
            step: 1,
            style: {
              padding: 5,
            },
          }}
          onChange={(e) => {
            if (!core) return;
            core.iter = Number(e.target.value);
          }}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my="auto">ma=</Typography>
        <TextField
          type="number"
          autoComplete="off"
          defaultValue={core?.ma}
          inputProps={{
            step: 1,
            min: 2,
            style: {
              padding: 5,
            },
          }}
          onChange={(e) => {
            if (!core) return;
            core.ma = Number(e.target.value);
            core.updateUniforms();
            e.target.value = `${core.ma}`;
          }}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my="auto">mb=</Typography>
        <TextField
          type="number"
          autoComplete="off"
          defaultValue={core?.mb}
          inputProps={{
            step: 1,
            min: 2,
            style: {
              padding: 5,
            },
          }}
          onChange={(e) => {
            if (!core) return;
            core.mb = Number(e.target.value);
            core.updateUniforms();
            e.target.value = `${core.mb}`;
          }}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my="auto">mc=</Typography>
        <TextField
          type="number"
          autoComplete="off"
          defaultValue={core?.mc}
          inputProps={{
            step: 1,
            min: 2,
            style: {
              padding: 5,
            },
          }}
          onChange={(e) => {
            if (!core) return;
            core.mc = Number(e.target.value);
            core.updateUniforms();
            e.target.value = `${core.mc}`;
          }}
        />
      </Stack>
    </Stack>
  );
}
