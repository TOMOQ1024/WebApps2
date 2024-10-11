import { Alert, Stack, TextField, Tooltip, Typography } from "@mui/material";
import Core from "../Core";

export default function LabelEditor({ core }: { core: Core | undefined }) {
  return (
    <Stack direction="column">
      <Typography textAlign="center">- 反復回数・頂点ラベル -</Typography>
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
        <Typography my="auto">A=</Typography>
        <TextField
          type="number"
          autoComplete="off"
          defaultValue={core?.labels.A}
          inputProps={{
            step: 1,
            min: 2,
            style: {
              padding: 5,
            },
          }}
          onChange={(e) => {
            if (!core) return;
            core.labels.A = Number(e.target.value);
            e.target.value = `${core.labels.A}`;
          }}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my="auto">B=</Typography>
        <TextField
          type="number"
          autoComplete="off"
          defaultValue={core?.labels.B}
          inputProps={{
            step: 1,
            min: 2,
            style: {
              padding: 5,
            },
          }}
          onChange={(e) => {
            if (!core) return;
            core.labels.B = Number(e.target.value);
            e.target.value = `${core.labels.B}`;
          }}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my="auto">C=</Typography>
        <TextField
          type="number"
          autoComplete="off"
          defaultValue={core?.labels.C}
          inputProps={{
            step: 1,
            min: 2,
            style: {
              padding: 5,
            },
          }}
          onChange={(e) => {
            if (!core) return;
            core.labels.C = Number(e.target.value);
            e.target.value = `${core.labels.C}`;
          }}
        />
      </Stack>
    </Stack>
  );
}
