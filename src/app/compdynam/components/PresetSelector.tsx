import { Parse } from "@/src/parser/Main";
import Core from "../CompDynamCore";
import { PresetExpressions } from "../Definitions";
import { Avatar, Container, Grid, Stack, Typography } from "@mui/material";

export default function PresetSelector({core}: {
  core: Core;
}) {
  function HandleClick(i: number){
    const expr = PresetExpressions[i].split('|');
    // テキストの解析
    let result = Parse(expr[1], ['z', 'i', 'c']);

    if(result.status){
      core.error = '';
      core.z0 = 'c';
      core.expr = expr[1];
      core.func = result.cstack.tocdgl(result.cstack.root);
    }
    else {
      core.error = `parse failed at preset selector`;
    }

    result = Parse(
      expr[0],
      ['i', 'c']
    );

    let z0: string = '';
    if(result.status){
      try {
        z0 = result.cstack.tocdgl(result.cstack.root);
      }
      catch(e) {
        core.error = `${e}`;
        return;
      }
      core.error = '';
      core.z0 = z0;
      core.z0expr = expr[0];
      core.updateShader();
    }
  }
  
  return (
    <Stack direction='column'>
      <Typography textAlign='center'>
        - プリセット選択 -
      </Typography>
      <Container>
        <Grid container spacing={1} columns={12} width={250}>
          {
            PresetExpressions.map((v,i)=>{
              return (
                <Grid key={v} item xs={12/5}>
                  <Avatar
                    className='preset-button'
                    variant='square'
                    alt={`Select \`${v}\``}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 1,
                      width: 34,
                      height: 34,
                    }}
                    src={`/resources/compdynam/images/p${i.toString(16)}.png`}
                    onClick={()=>HandleClick(i)}
                  />
                </Grid>
              );
            })
          }
        </Grid>
      </Container>
    </Stack>
  )
}
