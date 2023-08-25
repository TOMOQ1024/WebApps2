"use client"
import MainCanvas from "@/app/components/maincanvas";
import { useEffect, useState } from "react"
import GLMgr from "./Core";

export default function Main(){
  useEffect(() => {(async()=>{
    const glmgr = new GLMgr();
    glmgr.init();
    const onKeyDown = (e:KeyboardEvent) => {
      console.log(e.key);

      // 全画面切り替え
      if(e.key.toLocaleLowerCase() === 'f'){
        let cvs = document.getElementById('cvs') as HTMLCanvasElement;
        if (!document.fullscreenElement) {
          cvs.requestFullscreen();
        }
        else {
          document.exitFullscreen();
        }
      }
    }

    const onWheel = (e:WheelEvent) => {
      e.preventDefault();
      // // console.log(e);
      // let cvs = document.getElementById('cvs') as HTMLCanvasElement;
      // const rect = cvs.getBoundingClientRect();
      // // [0,1]正規化した座標
      // const m = Math.min(rect.width, rect.height);
      // const x = (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m;
      // const y = (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m;
      // const dy = e.deltaY;

      // glmgr.render();
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('wheel', onWheel, {passive: false});
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('wheel', onWheel);
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
