"use client";

import { useEffect, useState } from "react";
import Core from "./Core";
import { createVRMAnimationClip } from "@pixiv/three-vrm-animation";
import { AnimationMixer } from "three";
import "./app.scss";

export default function VRMPage() {
  const [core, setCore] = useState<Core | null>(null);

  useEffect(() => {
    let newCore: Core;
    if (!core) {
      newCore = new Core();
      setCore(newCore);

      newCore.beginLoop();
    }
    if (core) {
      const handleKeyDown = (e: KeyboardEvent) => {
        console.log(`key: ${e.key}`);
        console.log(`anim: ${core.VrmAnimations[+e.key]}`);
        if (/[0-6]/.test(e.key) && core.VrmAnimations[+e.key]) {
          core.currentVRMAIdx = +e.key;
          console.log(`gltf: ${core.gltf}`);
          if (core.gltf) {
            core.currentMixer = new AnimationMixer(core.gltf.scene);
            console.log(`vrm: ${core.gltf.userData.vrm}`);
            const clip = createVRMAnimationClip(
              core.currentAnimation,
              core.gltf.userData.vrm
            );
            console.log(`play: ${e.key}`);
            core.currentMixer.clipAction(clip).play();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        newCore.endLoop();
      };
    }
  }, [core]);

  return (
    <main className="main-wrapper">
      <canvas id="cvs" width={800} height={800} />
    </main>
  );
}
