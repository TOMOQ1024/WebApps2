'use client';
// import p5 from 'p5';
import { useEffect } from "react";

export default function MainWrapper() {
  useEffect(() => {
    // const sketch = (p: p5) => {
    //   p.setup = () => {
    //     p.createCanvas(400, 400);
    //   };

    //   p.draw = () => {
    //     p.background(220);
    //     p.ellipse(50, 50, 80, 80);
    //   };
    // };

    // new p5(sketch, document.querySelector('#main-wrapper') as HTMLElement);
  });

  return (
    <main id='main-wrapper'>
    </main>
  );
}
