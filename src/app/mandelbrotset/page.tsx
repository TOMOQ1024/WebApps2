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

    const onWheel = (e:WheelEvent) => {
      e.preventDefault();
      // console.log(e);
      let cvs = document.getElementById('cvs') as HTMLCanvasElement;
      const rect = cvs.getBoundingClientRect();
      // [0,1]正規化した座標
      const m = Math.min(rect.width, rect.height);
      const c = new Vec2(
        (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m,
        (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m
      );
      const dy = e.deltaY;
      wgmgr.graph.zoom(c, dy);

      wgmgr.updateGraphUniform();

      wgmgr.render();
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
      <MainCanvas
      width={2**10}
      height={2**10}
      />
    </main>
  )
}
