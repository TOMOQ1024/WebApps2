"use client"
import { Suspense, useEffect, useState } from "react";
import Core from "../Core";
import Controls from "./Controls";
import { useSearchParams } from "next/navigation";
import preventDefault from "@/src/preventDefault";
import sleep from "@/src/Sleep";

function _MainWrapper() {
  const searchParams = useSearchParams();
  const [core, setCore] = useState(new Core());
  const [isFull, setIsFull] = useState(false);
  useEffect(() => {
    if (searchParams) {
      let v = searchParams.get('nessy');
      if (v !== null) {
        core.nessyMode = true;
      }
    }

    if (!core.rawShaderData.frag) {
      core.init();
    }

    const onResize = async () => {
      await sleep(100);
      document.body.style.setProperty('--full-height',`${document.documentElement.clientHeight}px`);
      await sleep(100);
      const wr = document.querySelector('#main-wrapper') as HTMLElement;
      core.quad.width = wr.clientWidth * 4;
      core.quad.height = wr.clientHeight * 4;
      console.log(wr.clientHeight);
      core.app.renderer.resize(wr.clientWidth, wr.clientHeight);
      // // Resizeイベントの強制発火
      // const resizeEvent = new Event('resize');
      // wr.dispatchEvent(resizeEvent);
    }

    const onKeyDown = (e:KeyboardEvent) => {
      // フルスクリーン切り替え
      const tagName = (e.target as HTMLElement).tagName;
      if(e.key === 'f' && !e.shiftKey && !e.metaKey && tagName !== 'INPUT'){
        const wr = core.app.canvas.parentElement!;
        if (!document.fullscreenElement) {
          setIsFull(true);
          wr.requestFullscreen();
          onResize();
        }
        else {
          setIsFull(false);
          document.exitFullscreen();
          onResize();
        }
      }
      if(0 && e.key === 'v' && !e.shiftKey && !e.metaKey){
        // 仮
        const ipt = document.querySelector('#func-input') as HTMLSpanElement;
  
        const stream = core.app.canvas.captureStream();
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
  
    window.screen.orientation
    document.addEventListener('keydown', onKeyDown);
    document.body.addEventListener('resize', onResize);
    screen.orientation?.addEventListener('change', onResize);
    document.body.firstChild!.addEventListener('fullscreenchange', onResize);
    document.addEventListener('wheel', preventDefault, { passive: false });
    document.addEventListener('contextmenu', preventDefault, { passive: false });
    // document.addEventListener('touchstart', preventDefault, { passive: false });
    
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.removeEventListener('resize', onResize);
      screen.orientation?.removeEventListener('change', onResize);
      document.body.firstChild!.removeEventListener('fullscreenchange', onResize);
      document.removeEventListener('wheel', preventDefault);
      document.removeEventListener('contextmenu', preventDefault);
      // document.removeEventListener('touchstart', preventDefault);
    }
  }, [core, searchParams]);
  
  return (
    <main id='main-wrapper' className={isFull ? 'full' : ''}>
      <Controls core={core}/>
    </main>
  );
}

export default function MainWrapper () {
  return (
    <Suspense>
      <_MainWrapper/>
    </Suspense>
  )
}