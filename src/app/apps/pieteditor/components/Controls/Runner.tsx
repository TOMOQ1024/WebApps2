import { Runner, runner } from "../../src/Definitions";
import Core from "../../src/Core";
import styles from "../../page.module.scss";

export default function RunnerButtons({core}: {
  core: Core | undefined;
}) {
  const handleMouseDown = (e: React.MouseEvent, i: runner) => {
    switch (i) {
      case 'reset':
        core!.pp.reset();
        core!.draw();
        break;
      case 'run':
        core!.pp.run();
        core!.draw();
        break;
      case 'step':
        core!.pp.step();
        core!.draw();
        break;
    }
  }

  return (
    <div className={styles.runner}>
      {Runner.map((r,i)=>{
        return (
          <div key={i} onMouseDown={(e)=>handleMouseDown(e,r)} >
            {r}
          </div>
        )
      })}
    </div>
  )
}
