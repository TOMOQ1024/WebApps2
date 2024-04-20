import { COLORS, Colors, Operations } from "../../../src/Definitions";
import Core from "../../../src/Core";

export default function Palette({core}: {
  core: Core | undefined;
}) {
  const setFillColor = (e: React.MouseEvent, i: COLORS) => {
    if (e.buttons & 0b01) {
      core!.fillColor[0] = i;
    }
    else if (e.buttons & 0b10) {
      core!.fillColor[1] = i;
    }
  }
  return (
    <div id='palette'>
      {Colors.map((c,i)=>{
        return (
          <div key={i} style={{backgroundColor:c}} onMouseDown={(e)=>setFillColor(e,i)}>
            {Operations[i]}
          </div>
        )
      })}
    </div>
  )
}
