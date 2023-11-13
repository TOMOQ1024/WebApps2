"use client"
import MainCanvas from "@/components/maincanvas";
import { useEffect, useState } from "react"
import MandelCore from "./MandelCore";

export default function Main(){
  useEffect(() => {(async()=>{
    const mCore = new MandelCore();
    mCore.init();
    const onKeyDown = (e:KeyboardEvent) => {
      console.log(e);
      if(e.key.toLocaleLowerCase() === 'f'){
        let cvs = document.getElementById('cvs') as HTMLCanvasElement;
        cvs.requestFullscreen();
      }
    }

    const onWheel = (e:WheelEvent) => {
      e.preventDefault();
      // console.log(e);
      let cvs = document.getElementById('cvs') as HTMLCanvasElement;
      const rect = cvs.getBoundingClientRect();
      // [0,1]正規化した座標
      const m = Math.min(rect.width, rect.height);
      const x = (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m;
      const y = (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m;
      const dy = e.deltaY;
      mCore.graph.zoom(x, y, dy);

      mCore.updateGraphUniform();

      mCore.render();
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
