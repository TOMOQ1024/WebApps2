import { useEffect, useState } from "react";
import ControlsContent from "./ControlsContent";
import { ControlsTab } from "../../src/Definitions";
import Core from "../../src/Core";
import ControlsNav from "./ControlsNav";


export default function Controls({core}: {
  core: Core | undefined;
}) {
  const [controlsOpened, setControlsOpened] = useState(true);
  const [controlsTab, setControlsTab] = useState<ControlsTab>(ControlsTab.EXPRESSION);

  useEffect(()=>{
    const cs = document.getElementById('controls')!;

    // const antiPropagation = (e: Event) => {
    //   e.stopPropagation();
    // }

    // cs.addEventListener('keydown', antiPropagation);
    // cs.addEventListener('mousedown', antiPropagation);
    // cs.addEventListener('mousemove', antiPropagation);
    // cs.addEventListener('mouseup', antiPropagation);
    // cs.addEventListener('touchstart', antiPropagation);
    // cs.addEventListener('touchmove', antiPropagation);
    // cs.addEventListener('touchend', antiPropagation);

    // return () => {
    //   cs.removeEventListener('keydown', antiPropagation);
    //   cs.removeEventListener('mousedown', antiPropagation);
    //   cs.removeEventListener('mousemove', antiPropagation);
    //   cs.removeEventListener('mouseup', antiPropagation);
    //   cs.removeEventListener('touchstart', antiPropagation);
    //   cs.removeEventListener('touchmove', antiPropagation);
    //   cs.removeEventListener('touchend', antiPropagation);
    // }
  });

  return (
    <div id='controls' className={`${controlsOpened ? 'max' : 'min'} valid`}>
      {/* <ControlsNav controlsTab={controlsTab} setControlsTab={setControlsTab} setControlsOpened={setControlsOpened}/> */}
      <ControlsContent selected={controlsTab} core={core}/>
    </div>
  );
}