"use client"
import MainCanvas from "@/components/maincanvas";
import Vec2 from "@/src/Vec2";
import { useEffect, useState } from "react"
import WGMgr from "./WGMgr";

export default function Main(){
  useEffect(() => {(async()=>{
    const wgmgr = new WGMgr();
    await wgmgr.init();
    wgmgr.render();

    const onKeyDown = (e:KeyboardEvent) => {
      // フルスクリーン切り替え
      if(e.key === 'f' && !e.shiftKey && !e.metaKey){
        if (!document.fullscreenElement) {
          wgmgr.cvs.requestFullscreen();
        }
        else {
          document.exitFullscreen();
        }
      }
    }

    const onKeyUp = (e:KeyboardEvent) => {
      //
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);
    }
  })();}, []);


  return (
    <main
      style={{
        textAlign: 'center'
      }}
    >
      <MainCanvas
      width={2**10}
      height={2**10}
      />
    </main>
  )
}
