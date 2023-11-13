"use client"
import MainCanvas from "@/components/maincanvas";
import { useEffect, useState } from "react"
import Core from "./Core";

export default function Main(){
  useEffect(() => {(async()=>{
    document.title = 'Life Game';
    const core = new Core();

    const itv = setInterval(()=>{
      core.update();
      core.render();
    }, 1000/20);

    const onKeyDown = (e:KeyboardEvent) => {
      console.log(e);
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
    }

    const onMouseDown = (e: MouseEvent) => {
      const rect = core.cvs.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left)/rect.width*core.W);
      const y = Math.floor((e.clientY - rect.top)/rect.height*core.H);
      core.penDown(x,y);
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = core.cvs.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left)/rect.width*core.W);
      const y = Math.floor((e.clientY - rect.top)/rect.height*core.H);
      if(e.buttons)core.penMove(x,y);
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('wheel', onWheel, {passive: false});
    core.cvs.addEventListener('mousedown', onMouseDown);
    core.cvs.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('wheel', onWheel);
      core.cvs.removeEventListener('mousedown', onMouseDown);
      core.cvs.removeEventListener('mousemove', onMouseMove);
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
