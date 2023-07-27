"use client"
import MainCanvas from "@/app/components/maincanvas";
import { useEffect, useRef, useState } from "react"

export default function Main(){

  useEffect(() => {
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
  }, []);

  function HandleLoad2() {
    setTimeout(() => {
      const cvs = document.getElementById('cvs') as HTMLCanvasElement;
      const ctx = cvs.getContext('2d')!;
      const w = cvs.width;
      const h = cvs.height;

      let r = 0.5;
      let d = Math.PI*2/3;

      const f = (l:number, L=h/2) => {

        if(L-l < 1){
          ctx.beginPath();
          for(let i=0; i<3; i++){
            ctx.moveTo(0, 0);
            ctx.lineTo(L, 0);
            ctx.rotate(d);
          }
          ctx.stroke();
          return;
        }

        ctx.save();

        for(let i=0; i<3; i++){
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(l, 0);
          ctx.stroke();

          ctx.translate(l, 0);
          f(l * r, L-l);
          ctx.translate(-l, 0);
          ctx.rotate(d);
        }

        ctx.restore();
      }

      ctx.lineWidth = 1;
      ctx.translate(w/2, h/2);
      let t0=0, t=0;
      setInterval(()=>{
        t0 += 1e-2;
        t = w/2*(1-Math.exp(Math.sin(8*Math.PI*t0/Math.E)*Math.E/8/Math.PI-t0));
        if(w/2-t < 1e-2){
          t0 = t = 0;
        }
        // draw
        ctx.fillStyle = 'white';
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeStyle = 'black';
        f(w / 4, t%(w/2));
      }, 1000/60);
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
