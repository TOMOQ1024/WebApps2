"use client"
import { useEffect, useState } from "react";
import Vec2 from "@/src/Vec2";
import CDCore from "../CompDynamCore";
import Controls from "./Controls";
import GraphWrapper from "./GraphWrapper";
import { useSearchParams } from "next/navigation";

export default function MainWrapper() {
  const searchParams = useSearchParams();
  const [core, setCore] = useState(new CDCore());
  useEffect(() => {(async()=>{
    if (searchParams) {
      let v = searchParams.get('nessy');
      if (v !== null) {
        core.nessyMode = true;
      }
    }
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
      if(0 && e.key === 'v' && !e.shiftKey && !e.metaKey){
        // 仮
        const ipt = document.querySelector('#func-input') as HTMLSpanElement;

        const stream = core.glmgr.cvs!.captureStream();
        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/mp4',
          videoBitsPerSecond: 2500000,
        });
        const anchor = document.createElement('a');
        anchor.innerText = 'download';
        anchor.style.display = 'none';
        ipt.parentNode?.appendChild(anchor);

        recorder.ondataavailable = (e) => {
          const videoBlob = new Blob([e.data], {type: e.data.type});
          const blobUrl = window.URL.createObjectURL(videoBlob);
          anchor.download = 'movie.mp4';
          anchor.href = blobUrl;
          anchor.style.display = 'block';
        };
        
        // const C1 = '-0.2-0.7i';// c
        const C1 = '-0.63i';
        // const C2 = '-0.2-0.7i';
        // const C2 = '-0.6-0.42i';
        const C2 = '-0.8';
        ipt.innerHTML = `z^2+mix(${C1},${C2},${0.00})`;
        ipt.click();
        recorder.start();

        let t = 0;
        const itv = setInterval(()=>{
          const T = t*t*(3-2*t);

          ipt.innerHTML = `z^2+mix(${C1},${C2},${T})`;
          ipt.click();
          // ipt.innerHTML = `z^2+mix(c,-0.2-0.7i,${T.toFixed(2)})`;
          ipt.innerHTML = `z^2+mix(${C1},${C2},${T.toFixed(2)})`;

          if (1 < t) {
            clearInterval(itv);
            recorder.stop();
          }

          t+=0.005;
        }, 100);
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
      const rect = core.glmgr.cvs!.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      core.mMgr.pos = new Vec2(
        (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m,
        (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m
      );
      core.mMgr.isDown = true;
    }

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const rect = core.glmgr.cvs!.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      const newPos = new Vec2(
        (2 * (e.clientX - rect.left) / rect.width - 1) * rect.width / m,
        (2 * (e.clientY - rect.top) / rect.height - 1) * rect.height / m
      );
      if(core.mMgr.isDown){
        core.graph.translate(newPos.subed(core.mMgr.pos).negY());
        core.mMgr.pos = newPos;
        core.glmgr.updateGraphUniform();
        core.glmgr.render();
      }
    }

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      core.mMgr.isDown = false;
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const rect = core.glmgr.cvs!.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      const s = e.touches;
      for(let i=0; i<s.length; i++){
        core.tMgr.touches[e.touches[i].identifier] =
          new Vec2(
            (2 * (s[i].clientX - rect.left) / rect.width - 1) * rect.width / m,
            (2 * (s[i].clientY - rect.top) / rect.height - 1) * rect.height / m
          );
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = core.glmgr.cvs!.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      const c = e.changedTouches;
      switch(c.length) {
        case 0:
          return;
        case 1:
          let newPos = new Vec2(
            (2 * (c[0].clientX - rect.left) / rect.width - 1) * rect.width / m,
            (2 * (c[0].clientY - rect.top) / rect.height - 1) * rect.height / m
          );
          core.graph.translate(newPos.subed(core.tMgr.touches[c[0].identifier]).negY());
          core.tMgr.touches[c[0].identifier] = newPos;
          core.glmgr.updateGraphUniform();
          core.glmgr.render();
          break;
        default:
          let prevPos0 = Vec2.copy(core.tMgr.touches[c[0].identifier]);
          let newPos0 = new Vec2(
            (2 * (c[0].clientX - rect.left) / rect.width - 1) * rect.width / m,
            (2 * (c[0].clientY - rect.top) / rect.height - 1) * rect.height / m
          );
          core.tMgr.touches[c[0].identifier] = newPos0;

          let prevPos1 = Vec2.copy(core.tMgr.touches[c[1].identifier]);
          let newPos1 = new Vec2(
            (2 * (c[1].clientX - rect.left) / rect.width - 1) * rect.width / m,
            (2 * (c[1].clientY - rect.top) / rect.height - 1) * rect.height / m
          );
          core.tMgr.touches[c[1].identifier] = newPos1;

          // alert(newPos1.subed(newPos0).length() / prevPos1.subed(prevPos0).length());
          core.graph.zoom(prevPos0.added(prevPos1).muled(0.5), Math.log(prevPos1.subed(prevPos0).length() / newPos1.subed(newPos0).length())*500);
          core.glmgr.updateGraphUniform();
          core.glmgr.render();
          break;
      }
    }

    // const onTouchEnd = (e: TouchEvent) => {
    //   e.preventDefault();
    // }

    const onResize = () => {
      core.resizeCanvas();
    }

    document.addEventListener('keydown', onKeyDown);
    core.glmgr.cvs!.addEventListener('wheel', onWheel, {passive: false});
    document.addEventListener('mousedown', onMouseDown, {passive: false});
    document.addEventListener('mousemove', onMouseMove, {passive: false});
    document.addEventListener('mouseup', onMouseUp, {passive: false});
    document.addEventListener('touchstart', onTouchStart, {passive: false});
    document.addEventListener('touchmove', onTouchMove, {passive: false});
    // document.addEventListener('touchend', onTouchEnd, {passive: false});
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      core.glmgr.cvs!.removeEventListener('wheel', onWheel);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      // document.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
    }
  })();}, [core, searchParams]);
  
  return (
    <main id='main-wrapper'>
      <GraphWrapper/>
      <Controls core={core}/>
    </main>
  );
}