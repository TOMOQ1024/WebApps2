"use client"
import { Suspense, useEffect, useState } from "react";
import Core from "../Core";
import Controls from "./Controls";
import { useSearchParams } from "next/navigation";
import preventDefault from "@/src/preventDefault";

function _MainWrapper() {
  const searchParams = useSearchParams();
  const [core, setCore] = useState<Core>();
  const [isFull, setIsFull] = useState(false);
  useEffect(() => {
    const wr = document.querySelector('#main-wrapper') as HTMLElement;
    if (!core) {
      setCore(new Core());
    }
    else {
      if (searchParams) {
        let v = searchParams.get('nessy');
        if (v !== null) {
          core.nessyMode = true;
        }
      }
  
      const onResize = () => {
        const width = wr.clientWidth;
        const height = wr.clientHeight;

        // レンダラーのサイズを調整する
        core.renderer.setPixelRatio(window.devicePixelRatio);
        core.renderer.setSize(width, height);

        // カメラのアスペクト比を正す
        core.camera.aspect = width / height;
        core.camera.updateProjectionMatrix();
        setTimeout(() => {
          document.body.style.setProperty('--full-height',`${document.documentElement.clientHeight}px`);
        }, 100);
        // // Resizeイベントの強制発火
        // const resizeEvent = new Event('resize');
        // wr.dispatchEvent(resizeEvent);
      }
  
      const onKeyDown = (e:KeyboardEvent) => {
        // フルスクリーン切り替え
        const tagName = (e.target as HTMLElement).tagName;
        if(e.key === 'f' && !e.shiftKey && !e.metaKey && tagName !== 'INPUT'){
          const wr = core.cvs.parentElement!;
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
      }

      onResize();
    
      document.addEventListener('keydown', onKeyDown);
      window.addEventListener('resize', onResize);
      screen.orientation?.addEventListener('change', onResize);
      document.addEventListener('fullscreenchange', onResize);
      document.addEventListener('wheel', preventDefault, { passive: false });
      document.addEventListener('contextmenu', preventDefault, { passive: false });
      // document.addEventListener('touchstart', preventDefault, { passive: false });
      
      return () => {
        core.endLoop();
        document.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('resize', onResize);
        screen.orientation?.removeEventListener('change', onResize);
        document.removeEventListener('fullscreenchange', onResize);
        document.removeEventListener('wheel', preventDefault);
        document.removeEventListener('contextmenu', preventDefault);
        // document.removeEventListener('touchstart', preventDefault);
      }
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