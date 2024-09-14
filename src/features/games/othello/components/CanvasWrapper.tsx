import Core from "../Core";
import { useEffect } from "react";

export default function CanvasWrapper({ core }: { core: Core | undefined }) {
  useEffect(() => {
    if (!core) return;
    const cvs = core.cvs;

    const onMouseDown = () => {
      // core.flip();
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = core.cvs.getBoundingClientRect();

      //canvas上のマウスのXY座標
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      //canvasの幅と高さを取得
      const w = rect.width;
      const h = rect.height;

      //マウス座標を-1〜1の範囲に変換
      core.mousePos.x = (x / w) * 2 - 1;
      core.mousePos.y = -(y / h) * 2 + 1;
      core.raycaster.setFromCamera(core.mousePos, core.camera);

      // interactionPosの更新
      const io = core.raycaster.intersectObject(core.planeMesh, true);
      for (let i = 0; i < io.length; i++) {
        const name = io[i].object.name;
        if (/^Plane$/.test(name)) {
          const { x: x0, z: z0 } = io[i].point;
          core.interactionPos.x = Math.floor(x0 / 2 + 4);
          core.interactionPos.y = Math.floor(z0 / 2 + 4);
          return;
        }
      }
      core.interactionPos.x = Math.floor(-1);
      core.interactionPos.y = Math.floor(-1);
    };

    cvs.addEventListener("mousedown", onMouseDown);
    cvs.addEventListener("mousemove", onMouseMove);
    return () => {
      cvs.removeEventListener("mousedown", onMouseDown);
      cvs.removeEventListener("mousemove", onMouseMove);
    };
  }, [core]);

  return (
    <div id="canvas-wrapper">
      <canvas id="cvs" width={1024} height={1024} />
    </div>
  );
}
