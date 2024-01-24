"use client"
import MainCanvas from "@/components/maincanvas";
import Vec3 from "@/src/Vec3";
import { useEffect } from "react"
import { sNFlake } from "../Definitions";

export default function MainWrapper(){
  useEffect(() => {
    const cvs = document.getElementById('cvs') as HTMLCanvasElement;
    const ctx = cvs.getContext('2d')!;
    const w = cvs.width;
    const h = cvs.height;

    ctx.lineWidth = 1;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);
    ctx.translate(w/2, h/2);
    ctx.fillStyle = 'black';

    // const seeds = seeds_hexa;
    // const seeds = seeds_hepta;
    const seeds = sNFlake(5);

    let p = new Vec3(0, 0, 1);

    function iter () {
      let r = Math.random();

      for (let i=0; i<seeds.length; i++) {
        const s = seeds[i];
        if ((r-=s.p) < 0) {
          p = s.mat.multedByV3(p);
          break;
        }
      }
  
      ctx.beginPath();
      ctx.arc(p.x*40, p.y*40, .5, 0, Math.PI*2);
      ctx.fill();
    }

    const interval = setInterval(()=>{
      for (let i=0; i<1000; i++) {
        iter();
      }
    }, 1000/60);

    return () => {
      clearInterval(interval);
    }
  }, []);

  return (
    <main id='main-wrapper'>
      <MainCanvas/>
    </main>
  )
}
