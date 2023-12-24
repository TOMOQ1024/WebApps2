"use client"
import { useEffect, useState } from "react";
import CanvasWrapper from "./CanvasWrapper";
import Core from "../Core";

export default function MainWrapper() {
  const [core, setCore] = useState(new Core());
  useEffect(() => {(async()=>{
    await core.init();

    const HandleKeyDown = (e: KeyboardEvent) => {
      if(!core.keys[e.key.toLowerCase()]){
        core.keys[e.key.toLowerCase()] = 2;
      }

      // フルスクリーン切り替え
      if(e.key === 'f' && !e.shiftKey && !e.metaKey){
        if (!document.fullscreenElement) {
          core.glmgr.cvs!.requestFullscreen();
        }
        else {
          document.exitFullscreen();
        }
      }
    }

    const HandleKeyUp = (e: KeyboardEvent) => {
      if(core.keys[e.key.toLowerCase()] === 2)
        setTimeout(()=>{
          core.keys[e.key.toLowerCase()]=0;
        }, 20);
      else core.keys[e.key.toLowerCase()] = 0;
    }

    const HandleWheel = (e:WheelEvent) => {
      e.preventDefault();
    }

    document.addEventListener('keydown', HandleKeyDown);
    document.addEventListener('keyup', HandleKeyUp);
    document.addEventListener('wheel', HandleWheel, {passive: false});
    return () => {
      document.removeEventListener('keydown', HandleKeyDown);
      document.removeEventListener('keyup', HandleKeyUp);
      document.removeEventListener('wheel', HandleWheel);
    }
  })();}, [core]);
  
  return (
    <main id='main-wrapper'>
      <CanvasWrapper/>
    </main>
  );
}