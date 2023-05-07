"use client"
import { useEffect, useRef, useState } from "react"

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
      <canvas
        id='cvs'
        width='1024'
        height='1024'
        style={{
          width: '700px',
          maxWidth: 'min(90vw,85vh)',
          maxHeight: 'min(90vw,85vh)',
          margin: '10px'
        }}
      />
    </main>
  )
}
