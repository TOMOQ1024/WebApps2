"use client"
import MainCanvas from "@/app/components/maincanvas";
import { useEffect, useState } from "react";
import WGMgr from "./Core";

export default function Main(){
  useEffect(() => {(async()=>{
    const wgmgr = new WGMgr();
    await wgmgr.init();

    const HandleKeyDown = (e: KeyboardEvent) => {
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

    const HandleKeyUp = (e: KeyboardEvent) => {
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