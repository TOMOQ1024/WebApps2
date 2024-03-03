'use client';
import { useEffect, useState } from "react";
import Core from "../Core";

export default function MainWrapper() {
  const [core, setCore] = useState<Core>();

  useEffect(() => {
    if (!core) {
      const initCore = new Core();
      setCore(initCore);
      
      const HandleKeyDown = (e: KeyboardEvent) => {
        if (/\s|arrow/.test(e.key)) e.preventDefault();
        if(!initCore.keys[e.key.toLowerCase()] && !e.metaKey){
          initCore.keys[e.key.toLowerCase()] = 2;
        }
  
        // フルスクリーン切り替え
        if(e.key === 'f' && !e.shiftKey && !e.metaKey){
          if (!document.fullscreenElement) {
            initCore.threeMgr.cvs.requestFullscreen();
            // initCore.threeMgr.cvs.requestPointerLock();
          }
          else {
            document.exitFullscreen();
          }
        }
      }
  
      const HandleKeyUp = (e: KeyboardEvent) => {
        if(initCore.keys[e.key.toLowerCase()] === 2)
          setTimeout(()=>{
            initCore.keys[e.key.toLowerCase()]=0;
          }, 20);
        else initCore.keys[e.key.toLowerCase()] = 0;
      }
  
      // const HandleWheel = (e:WheelEvent) => {
      //   e.preventDefault();
      // }
  
      const onResize = () => {
        console.log('resized');
        // const wrapper = initCore.glmgr.cvs!.parentElement!;
        // const rect = wrapper.getBoundingClientRect();
        // initCore.glmgr.cvs!.width = rect.width * initCore.resFactor;
        // initCore.glmgr.cvs!.height = rect.height * initCore.resFactor;
        // initCore.cvsResized = true;
        // initCore.update();
        // initCore.glmgr.render();
      }
  
      (async()=>{
        await initCore.init();
  
        document.addEventListener('keydown', HandleKeyDown, {passive: false});
        document.addEventListener('keyup', HandleKeyUp);
        // document.addEventListener('wheel', HandleWheel, {passive: false});
        window.addEventListener('resize', onResize);
      })();
      return () => {
        initCore.endLoop();
        document.removeEventListener('keydown', HandleKeyDown);
        document.removeEventListener('keyup', HandleKeyUp);
        // document.removeEventListener('wheel', HandleWheel);
        window.removeEventListener('resize', onResize);
      }
    }
  }, [core]);

  return (
    <main id='main-wrapper'>
      <canvas id='cvs' width={800} height={600}></canvas>
    </main>
  );
}
