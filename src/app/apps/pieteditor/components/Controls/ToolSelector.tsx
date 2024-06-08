import { TOOLS, Tools } from "../../src/Definitions";
import Core from "../../src/Core";
import { useState } from "react";
import styles from "../../page.module.scss";

export default function ToolSelector({core}: {
  core: Core | undefined;
}) {
  const [tool, setTool] = useState<TOOLS>(TOOLS.HAND);

  const handleMouseDown = (e: React.MouseEvent, i: TOOLS) => {
    setTool(i);
    core!.tool = i;
  }

  return (
    <div className={styles.tool_selector}>
      {Tools.map((t,i)=>{
        const f = i === tool;
        return (
          <div key={i} onMouseDown={(e)=>handleMouseDown(e,i)} className={f ? styles.selected : ''}>
            {t}
          </div>
        )
      })}
    </div>
  )
}
