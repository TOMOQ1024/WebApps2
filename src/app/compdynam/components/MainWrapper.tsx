"use client"
import { useEffect, useState } from "react";
import Vec2 from "@/src/Vec2";
import CDCore from "../CompDynamCore";
import Controls from "./Controls";
import GraphWrapper from "./GraphWrapper";

export default function MainWrapper() {
  const [core, setCore] = useState(new CDCore());
  useEffect(() => {(async()=>{
    await core.init();

    const onKeyDown = (e:KeyboardEvent) => {
      // フルスクリーン切り替え
      if(e.key === 'f' && !e.shiftKey && !e.metaKey){
        if (!document.fullscreenElement) {
          core.glmgr.cvs!.requestFullscreen();
        }
        else {
          document.exitFullscreen();
        }
      }
    }

    const onWheel = (e:WheelEvent) => {
      e.preventDefault();
      // console.log(e);
      const rect = core.glmgr.cvs!.getBoundingClientRect();
      // [0,1]正規化した座標
      const m = Math.min(rect.width, rect.height);
      const c = new Vec2(
        (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m,
        (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m
      );
      const dy = e.deltaY;
      core.graph.zoom(c, dy);

      core.glmgr.updateGraphUniform();

      core.glmgr.render();
    }

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = core.glmgr.cvs!.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      core.mouse.pos = new Vec2(
        (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m,
        (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m
      );
      core.mouse.isDown = true;
    }

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const rect = core.glmgr.cvs!.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      const newPos = new Vec2(
        (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m,
        (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m
      );
      if(core.mouse.isDown){
        core.graph.translate(newPos.subed(core.mouse.pos).negY());
        core.mouse.pos = newPos;
        core.glmgr.updateGraphUniform();
        core.glmgr.render();
      }
    }

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      core.mouse.isDown = false;
    }

    const onResize = (e: UIEvent) => {
      const wrapper = core.glmgr.cvs!.parentElement!;
      const rect = wrapper.getBoundingClientRect();
      core.glmgr.cvs!.width = rect.width;
      core.glmgr.cvs!.height = rect.height;
      core.glmgr.updateResolutionUniform();
      core.glmgr.render();
    }

    document.addEventListener('keydown', onKeyDown);
    core.glmgr.cvs!.addEventListener('wheel', onWheel, {passive: false});
    document.addEventListener('mousedown', onMouseDown, {passive: false});
    document.addEventListener('mousemove', onMouseMove, {passive: false});
    document.addEventListener('mouseup', onMouseUp, {passive: false});
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      core.glmgr.cvs!.removeEventListener('wheel', onWheel);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
    }
  })();}, [core]);
  
  return (
    <main id='main-wrapper'>
      <GraphWrapper/>
      <Controls core={core}/>
    </main>
  );
}