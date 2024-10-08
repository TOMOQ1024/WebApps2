"use client";
import { useEffect } from "react";
import * as PIXI from "pixi.js";

export default function PixiTemplate() {
  useEffect(() => {
    (async () => {
      const wr = document.querySelector("#pixi-wrapper") as HTMLElement;
      const app = new PIXI.Application();
      await app.init({
        resizeTo: wr,
      });
      wr.appendChild(app.canvas as HTMLCanvasElement);

      // create a new Sprite from an image path
      const tx = (await PIXI.Assets.load(
        "https://pixijs.com/assets/bunny.png"
      )) as PIXI.Texture;
      const bunny = PIXI.Sprite.from(tx);

      bunny.scale.set(3);

      bunny.anchor.set(0.5);

      bunny.x = app.screen.width / 2;
      bunny.y = app.screen.height / 2;

      app.stage.addChild(bunny);

      // Listen for animate update
      let t = 0;
      app.ticker.add((tck) => {
        t += tck.deltaTime * 5e-2;
        bunny.rotation += Math.sin(t) / 4;
      });
    })();
  }, []);
  return <div id="pixi-wrapper"></div>;
}
