import { Runner, runner } from "../../../src/Definitions";
import Core from "../../../src/Core";

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
    <div id='tool-selector'>
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
