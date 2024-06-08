import Core from "../CompDynamCore";
import { Alert, Stack, TextField, Tooltip, Typography } from "@mui/material";

export default function FuncEditor({core}: {
  core: Core;
}) {
  return (
    <Stack direction='column'>
      <Typography textAlign='center'>
        - 関数・反復回数 -
      </Typography>
      <Stack direction="row" spacing={1}>
        <Typography my='auto'>
          反復回数
        </Typography>
        <TextField
          type='number'
          autoComplete='off'
          defaultValue={core.iter}
          inputProps={{
            step: 1,
            style: {
              padding: 5,
            }
          }}
          onChange={e=>{
            core.setIter(Number(e.target.value));
            core.updateShader();
          }}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my='auto'>
          z_0=
        </Typography>
        <TextField
          autoComplete='off'
          defaultValue={core.z0expr}
          inputProps={{
            style: {
              padding: 5
            }
          }}
          onChange={e => core.z0expr = e.target.value}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my='auto'>
          f(z)=
        </Typography>
        <Tooltip title={core.error ?? <Alert severity="error">{core.error}</Alert>} arrow>
          <TextField
            id='func-input'
            autoComplete='off'
            defaultValue={core.funcexpr}
            inputProps={{
              style: {
                padding: 5
              }
            }}
            onChange={e => core.funcexpr = e.target.value}
            onClick={e => core.funcexpr = (e.target as HTMLInputElement).value}
          />
        </Tooltip>
      </Stack>
    </Stack>
  )
}
