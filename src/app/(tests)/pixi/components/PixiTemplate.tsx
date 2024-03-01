'use client';
import { useEffect } from "react";
import * as PIXI from 'pixi.js';

export default function PixiTemplate() {
  useEffect(()=>{
    const wr = document.querySelector('#pixi-wrapper') as HTMLElement;
    const app = new PIXI.Application({
      resizeTo: wr
    });
    wr.appendChild(app.view as HTMLCanvasElement);

    // create a new Sprite from an image path
    const bunny = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png');

    bunny.scale.set(3);

    bunny.anchor.set(0.5);

    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny as PIXI.DisplayObject);

    // Listen for animate update
    let t = 0;
    app.ticker.add((delta) =>
    {
        t += delta * 5e-2;
        bunny.rotation += Math.sin(t)/4;
    });
  }, []);
  return (
    <div id='pixi-wrapper'></div>
  )
}