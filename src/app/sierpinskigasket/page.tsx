"use client"
import MainCanvas from "@/components/maincanvas";
import { useEffect } from "react"

export default function Main(){

  useEffect(() => {
    const cvs = document.getElementById('cvs') as HTMLCanvasElement;
      const ctx = cvs.getContext('2d')!;
      const w = cvs.width;
      const h = cvs.height;
  
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'white';
      for(let y=0; y<h; y++){
        for(let x=0; x<w; x++){
          if(x&y){
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
  }, []);

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

/*
// Strict Mode

export default function Main(){
  const refFirstRef = useRef(true);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (refFirstRef.current) {
        refFirstRef.current = false;
        return;
      }
    }

    HandleLoad();
  }, []);

  function HandleLoad() {
    setTimeout(() => {
      const cvs = document.getElementById('cvs') as HTMLCanvasElement;
      const ctx = cvs.getContext('2d')!;
      const w = cvs.width;
      const h = cvs.height;
  
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'white';
      for(let y=0; y<h; y++){
        for(let x=0; x<w; x++){
          if(x&y){
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }, 100);
  }

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
*/
