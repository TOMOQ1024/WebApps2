"use client"
import MainCanvas from "@/app/components/maincanvas";
import { useEffect, useState } from "react"
import GLMgr from "./Core";

export default function Main(){
  useEffect(() => {(async()=>{
    const glmgr = new GLMgr();
    await glmgr.init();

    setInterval(()=>{
      glmgr.update();
      glmgr.render();
    }, 1000/60);

    const HandleKeyDown = (e: KeyboardEvent) => {
      if(!glmgr.keys[e.key.toLowerCase()]){
        glmgr.keys[e.key.toLowerCase()] = 2;
      }

      // フルスクリーン切り替え
      if(e.key === 'f' && !e.shiftKey && !e.metaKey){
        if (!document.fullscreenElement) {
          glmgr.cvs.requestFullscreen();
        }
        else {
          document.exitFullscreen();
        }
      }
    }

    const HandleKeyUp = (e: KeyboardEvent) => {
      if(glmgr.keys[e.key.toLowerCase()] === 2)
        setTimeout(()=>{
          glmgr.keys[e.key.toLowerCase()]=0;
        }, 20);
      else glmgr.keys[e.key.toLowerCase()] = 0;
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
  })();}, []);


  return (
    <main
      style={{
        textAlign: 'center'
      }}
    >
      <MainCanvas/>
    </main>
  )
}
