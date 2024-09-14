"use client";
import "./app.scss";
import { useEffect, useState } from "react";
import CanvasWrapper from "./components/CanvasWrapper";
import Core from "./Core";

export default function OthelloPage() {
  const [core, setCore] = useState<Core>();
  useEffect(() => {
    if (!core) {
      setCore(new Core());
      return;
    }
    const cvs = core.cvs;

    core.beginLoop();

    const onMouseDown = () => {
      console.clear();
      // core.diskMgr.roll(1, 4);
    };

    const onResize = () => {
      const wrapper = cvs.parentElement!;
      const rect = wrapper.getBoundingClientRect();
      cvs.width = rect.width;
      cvs.height = rect.height;
      core.camera.aspect = cvs.width / cvs.height;
      core.camera.updateProjectionMatrix();
      core.renderer.setSize(rect.width, rect.height);
      core.renderer.setPixelRatio(devicePixelRatio);
    };

    onResize();

    cvs.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", onResize);
    return () => {
      cvs.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", onResize);
    };
  }, [core]);

  return (
    <main id="main-wrapper">
      <CanvasWrapper />
    </main>
  );
}
