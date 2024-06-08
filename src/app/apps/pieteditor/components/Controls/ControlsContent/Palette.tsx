import { COLORS, Colors, Operations } from "../../../src/Definitions";
import Core from "../../../src/Core";
import { useState } from "react";

export default function Palette({core}: {
  core: Core | undefined;
}) {
  const [fillColor, setFillColor] = useState<[number, number]>([0, 0]);
  const handleMouseDown = (e: React.MouseEvent, i: COLORS) => {
    if (e.buttons & 0b01) {
      core!.fillColor[0] = i;
      setFillColor(f=>[i, f[1]]);
    }
    else if (e.buttons & 0b10) {
      core!.fillColor[1] = i;
      setFillColor(f=>[f[1], i]);
    }
  }
  return (
    <div id='palette'>
      {Colors.map((c,i)=>{
        return (
          <div key={i} style={{backgroundColor:c}} onMouseDown={(e)=>handleMouseDown(e,i)}>
            <span>
              {17 < i ? Operations[i] :
                Operations[(i-fillColor[0]+18)%18]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
