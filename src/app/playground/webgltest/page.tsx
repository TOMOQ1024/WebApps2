"use client"
import MainCanvas from "@/app/components/maincanvas";
import { useEffect, useState } from "react"
import GLMgr from "./Core";
import Vec3 from "./Vector";

export default function Main(){
  useEffect(() => {(async()=>{
    const glmgr = new GLMgr();
    glmgr.init();

    setInterval(()=>{
      glmgr.render();
    }, 1000/60);

    const onKeyDown = (e:KeyboardEvent) => {
      console.log(e.key);

      const key = e.key.toLocaleLowerCase();

      // 全画面切り替え
      switch(key){
        case 'f':
          if (!document.fullscreenElement) {
            glmgr.cvs.requestFullscreen();
          }
          else {
            document.exitFullscreen();
          }
          break;
        case 'a':
          glmgr.camera.position.addBy(Vec3.scale(glmgr.camera.left, 0.2));
          glmgr.matUpdated = true;
          break;
        case 'd':
          glmgr.camera.position.addBy(Vec3.scale(glmgr.camera.right, 0.2));
          glmgr.matUpdated = true;
          break;
        case 'w':
          glmgr.camera.position.addBy(Vec3.scale(glmgr.camera.direction, 0.2));
          glmgr.matUpdated = true;
          break;
        case 's':
          glmgr.camera.position.addBy(Vec3.scale(glmgr.camera.direction, -0.2));
          glmgr.matUpdated = true;
          break;
        case 'arrowleft':
          glmgr.camera.angleH -= .1;
          glmgr.matUpdated = true;
          break;
        case 'arrowright':
          glmgr.camera.angleH += .1;
          glmgr.matUpdated = true;
          break;
        case 'arrowup':
          glmgr.camera.angleV = Math.min(Math.max(glmgr.camera.angleV + .1, -Math.PI/2), Math.PI/2);
          glmgr.matUpdated = true;
          break;
        case 'arrowdown':
          glmgr.camera.angleV = Math.min(Math.max(glmgr.camera.angleV - .1, -Math.PI/2), Math.PI/2);
          glmgr.matUpdated = true;
          break;
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
