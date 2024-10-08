"use client"
import MainCanvas from "@/components/maincanvas";
import { useEffect } from "react"
import Core from "./Core";

export default function MainWrapper(){
  useEffect(() => {
    let core: Core;
    let itv: NodeJS.Timeout;

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

    (async()=>{
      document.title = 'Life Game';
      core = new Core();

      itv = setInterval(()=>{
        core.update();
        core.render();
      }, 1000/20);

      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('wheel', onWheel, {passive: false});
      core.cvs.addEventListener('mousedown', onMouseDown);
      core.cvs.addEventListener('mousemove', onMouseMove);
    })();
    
    return () => {
      clearInterval(itv);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('wheel', onWheel);
      core.cvs.removeEventListener('mousedown', onMouseDown);
      core.cvs.removeEventListener('mousemove', onMouseMove);
    }
  }, []);


  return (
    <div
      style={{
        textAlign: 'center'
      }}
    >
      <MainCanvas/>
    </div>
  )
}
