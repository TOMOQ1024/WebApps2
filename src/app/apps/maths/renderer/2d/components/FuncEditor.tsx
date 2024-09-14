import Core from "../Core";
import { Alert, Stack, TextField, Tooltip, Typography } from "@mui/material";

export default function FuncEditor({core}: {
  core: Core;
}) {
  return (
    <Stack direction='column'>
      <Typography textAlign='center'>
        - 数式 -
      </Typography>
      <Stack direction="row" spacing={1}>
        <Typography my='auto'>
          不等式：
        </Typography>
        <Tooltip title={core.error ?? <Alert severity="error">{core.error}</Alert>} arrow>
          <TextField
            autoComplete='off'
            defaultValue={core.funcexpr}
            inputProps={{
              style: {
                padding: 5
              }
            }}
            onChange={e => core.funcexpr = e.target.value}
          />
        </Tooltip>
      </Stack>
    </Stack>
  )
}
