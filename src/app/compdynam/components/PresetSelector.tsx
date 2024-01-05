import { Parse } from "@/src/parser/Main";
import { useEffect, useRef } from "react";
import CDCore from "../CompDynamCore";
import { PresetExpressions } from "../Definitions";

export default function PresetSelector({core}: {
  core: CDCore;
}) {
  const ref = useRef<HTMLElement>(null);

  function HandleClick(i: number){
    const expr = PresetExpressions[i];
    // テキストの解析
    let result = Parse(expr, ['z', 'i']);

    const ctl = document.getElementById('controls')!
    if(result.status){
      ctl.className = ctl.className.replace(/(?:in)?valid/, 'valid');
      core.setExpression(expr);
      core.func = result.cstack.tocdgl(result.cstack.root);
      core.init();
    }
    else {
      ctl.className = ctl.className.replace(/(?:in)?valid/, 'invalid');
      console.error(`failed to parse preset expression no.${i}`);
    }
  }
  
  return (
    <div id='preset-selector'>
      <div>- プリセット選択 -</div>
      <div id='preset-button-wrapper'>
        {
          PresetExpressions.map((v,i)=>{
            return (
              <input
              className='preset-button'
              key={v}
              type='image'
              alt={`Select \`${v}\``}
              src={`/resources/compdynam/images/p${i.toString(16)}.png`}
              onClick={()=>HandleClick(i)}
              />
            );
          })
        }
      </div>
    </div>
  )
}
