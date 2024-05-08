import { Parse } from "@/src/parser/Main";
import Core from "../CompDynamCore";
import { Alert, Stack, TextField, Tooltip, Typography } from "@mui/material";

export default function FuncEditor({core}: {
  core: Core;
}) {
  function HandleZ0Input(e: React.ChangeEvent<HTMLInputElement>) {
    // テキストの解析
    let result = Parse(
      e.target.value,
      ['i', 'c', 't']
    );
    console.log(e.target.value);

    let z0: string = '';
    if(result.status){
      try {
        z0 = result.cstack.tocdgl(result.cstack.root);
      }
      catch(e) {
        core.error = `${e}`;
        console.error(e);
        return;
      }
      core.error = '';
      core.z0 = z0;
      core.z0expr = e.target.value;
      core.updateShader();
    }
    else {
      core.error = 'parse failed';
    }
  }


  function HandleFuncInput(e: React.ChangeEvent<HTMLInputElement>) {
    // テキストの解析
    let result = Parse(
      e.target.value,
      ['z', 'i', 'c', 't']
    );

    let func: string = '';
    if(result.status){
      try {
        func = result.cstack.tocdgl(result.cstack.root);
      }
      catch(e) {
        core.error = `${e}`;
        console.error(e);
        return;
      }
      core.error = '';
      core.func = func;
      core.expr = e.target.value;
      core.updateShader();
    }
    else {
      core.error = 'parse failed';
    }
  }
  
  return (
    <Stack direction='column' p={1}>
      <Typography>
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
              padding: 5
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
          onChange={HandleZ0Input}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography my='auto'>
          f(z)=
        </Typography>
        <Tooltip title={core.error ?? <Alert severity="error">{core.error}</Alert>} arrow>
          <TextField
            autoComplete='off'
            defaultValue={core.expr}
            inputProps={{
              style: {
                padding: 5
              }
            }}
            onChange={HandleFuncInput}
          />
        </Tooltip>
      </Stack>
    </Stack>
  )
}
