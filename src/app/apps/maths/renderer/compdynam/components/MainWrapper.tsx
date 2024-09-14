"use client";
import { useEffect, useState } from "react";
import Core from "../Core";

export default function MainWrapper() {
  const [core, setCore] = useState<Core>();

  useEffect(() => {
    if (!core) {
      const initCore = new Core();
      setCore(initCore);

      const HandleClick = (e: MouseEvent) => {
        // (e.target as HTMLCanvasElement).requestPointerLock();
      };

      const onResize = () => {
        console.log("resized");
      };

      const HandleMouseMove = (e: MouseEvent) => {};

      const cvs = document.querySelector("#cvs") as HTMLCanvasElement;
      (async () => {
        await initCore.init();

        cvs.addEventListener("click", HandleClick);
        // document.addEventListener('wheel', HandleWheel, {passive: false});
        window.addEventListener("resize", onResize);
        document.addEventListener("mousemove", HandleMouseMove);
      })();
      return () => {
        initCore.endLoop();
        cvs.removeEventListener("click", HandleClick);
        // document.removeEventListener('wheel', HandleWheel);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("mousemove", HandleMouseMove);
      };
    }
  }, [core]);

  return (
    <main id="main-wrapper">
      <canvas id="cvs" width={800} height={600}></canvas>
    </main>
  );
}
