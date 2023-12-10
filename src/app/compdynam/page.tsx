"use client"
import MainCanvas from "@/components/maincanvas";
import Vec2 from "@/src/Vec2";
import { useEffect, useState } from "react"
import GLMgr from "./GLMgr";
import Mouse from "./Mouse";

export default function Main(){
  useEffect(() => {(async()=>{
    const mouse = new Mouse();
    const glmgr = new GLMgr();
    await glmgr.init();
    glmgr.render();

    const onKeyDown = (e:KeyboardEvent) => {
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

    const onWheel = (e:WheelEvent) => {
      e.preventDefault();
      // console.log(e);
      const rect = glmgr.cvs.getBoundingClientRect();
      // [0,1]正規化した座標
      const m = Math.min(rect.width, rect.height);
      const c = new Vec2(
        (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m,
        (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m
      );
      const dy = e.deltaY;
      glmgr.graph.zoom(c, dy);

      glmgr.updateGraphUniform();

      glmgr.render();
    }

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const rect = glmgr.cvs.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      mouse.pos = new Vec2(
        (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m,
        (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m
      );
      mouse.isDown = true;
    }

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const rect = glmgr.cvs.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      const newPos = new Vec2(
        (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m,
        (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m
      );
      if(mouse.isDown){
        glmgr.graph.translate(newPos.subed(mouse.pos).negY());
        mouse.pos = newPos;
        glmgr.updateGraphUniform();
        glmgr.render();
      }
    }

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      mouse.isDown = false;
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('wheel', onWheel, {passive: false});
    document.addEventListener('mousedown', onMouseDown, {passive: false});
    document.addEventListener('mousemove', onMouseMove, {passive: false});
    document.addEventListener('mouseup', onMouseUp, {passive: false});
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('wheel', onWheel);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
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