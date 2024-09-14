import Core from "../CompDynamCore";
import { PresetExpressions } from "../Definitions";
import { Avatar, Container, Grid, Stack, Typography } from "@mui/material";

export default function PresetSelector({core}: {
  core: Core;
}) {
  function HandleClick(i: number){
    const expr = PresetExpressions[i].split('|');
    // テキストの解析
    core.funcexpr = expr[1];
    core.z0expr = expr[0];
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
