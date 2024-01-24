"use client"
import MainCanvas from "@/components/maincanvas";
import Mat3 from "@/src/Mat3";
import Vec2 from "@/src/Vec2";
import Vec3 from "@/src/Vec3";
import { useEffect } from "react"

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

    const seeds_n_flake: {mat:Mat3;p:number}[] = [];
    const N = 5;
    const R = 1/2/(1+(n=>{
      let sum = 0;
      for(let k=1; k<=n; k++){
        sum += Math.cos(2*Math.PI*k/N)
      }
      return sum;
    })(Math.floor(N/4)));
    // seeds_n_flake.push({
    //   p: 1/(N+1),
    //   mat: Mat3.Identity.mixBy(Mat3.cMat(new Vec2(0, 0)), N%2 ? (1-R)/Math.cos(Math.PI/N)-R : 1-2*R)
    // });
    for (let i=0; i<N; i++) {
      seeds_n_flake.push({
        p: 1/(N),
        mat: Mat3.Identity.mixedBy(
          Mat3.cMat((new Vec2(11, 0)).rotatedBy(Math.PI*2/N*i)),
          R
        )
      });
    }


    const seeds_4th_gasket: {mat:Mat3;p:number}[] = [
      {
        p: 1/4,
        mat: new Mat3(
          0.50, 0.00, 0.00,
          0.00, 0.50, 0.00,
          0.00, 0.00, 1.00,
        ),
      },
      {
        p: 1/4,
        mat: new Mat3(
          0.50, 0.00, 4.00,
          0.00, 0.50, 7.00,
          0.00, 0.00, 1.00,
        ),
      },
      {
        p: 1/4,
        mat: new Mat3(
          0.50, 0.00, -5.00,
          0.00, 0.50, 9.00,
          0.00, 0.00, 1.00,
        ),
      },
      {
        p: 1/4,
        mat: new Mat3(
          0.50, 0.00, 2.00,
          0.00, 0.50, 12.0,
          0.00, 0.00, 1.00,
        ),
      },
    ];

    const seeds_gasket: {mat:Mat3;p:number}[] = [
      {
        p: 1/3,
        mat: new Mat3(
          0.50, 0.00, 0.00,
          0.00, 0.50, 0.00,
          0.00, 0.00, 1.00,
        ),
      },
      {
        p: 1/3,
        mat: new Mat3(
          0.50, 0.00, 4.00,
          0.00, 0.50, 9.00,
          0.00, 0.00, 1.00,
        ),
      },
      {
        p: 1/3,
        mat: new Mat3(
          0.50, 0.00, -4.00,
          0.00, 0.50, 9.00,
          0.00, 0.00, 1.00,
        ),
      },
    ];

    const seeds_fern: {mat:Mat3;p:number}[] = [
      {
        p: 0.01,
        mat: new Mat3(
          0.00, 0.00, 0.00,
          0.00, 0.16, 0.00,
          0.00, 0.00, 1.00,
        ),
      },
      {
        p: 0.85,
        mat: new Mat3(
          0.85, 0.04, 0.00,
          -.04, 0.85, 1.60,
          0.00, 0.00, 1.00,
        ),
      },
      {
        p: 0.07,
        mat: new Mat3(
          0.20, -.26, 0.00,
          0.23, 0.22, 1.60,
          0.00, 0.00, 1.00,
        ),
      },
      {
        p: 0.07,
        mat: new Mat3(
          -.15, 0.28, 0.00,
          0.26, 0.24, 0.44,
          0.00, 0.00, 1.00,
        ),
      },
    ];

    // const seeds = seeds_hexa;
    // const seeds = seeds_hepta;
    const seeds = seeds_n_flake;

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
