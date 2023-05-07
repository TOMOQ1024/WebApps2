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

      let r = 0.5;
      let d0 = 0.0;
      let d = 0.0;

      const f = (l:number) => {
        if (l < 1) return;
        ctx.save();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(l, 0);
        ctx.stroke();
        ctx.translate(l, 0);
        
        f(l * r);
        ctx.rotate(d);
        f(l * r);
        ctx.rotate(d);
        f(l * r);

        ctx.restore();
      }

      ctx.lineWidth = 1;
      ctx.translate(w/2, h/2);
      setInterval(()=>{
        d0 += Math.PI / 500;
        d = d0 - Math.sin(6*d0)/6;
        // draw
        ctx.fillStyle = 'white';
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeStyle = 'black';
        ctx.save();
        f(w / 4);
        ctx.rotate(d);
        f(w / 4);
        ctx.rotate(d);
        f(w / 4);
        ctx.restore();
      }, 1000/60);
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
