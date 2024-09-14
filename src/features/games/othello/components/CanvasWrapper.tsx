import Core from "../Core";
import { useEffect } from "react";

export default function CanvasWrapper({ core }: { core: Core | undefined }) {
  useEffect(() => {
    if (!core) return;
    const cvs = core.cvs;

    const onMouseDown = () => {
      const io = core.raycaster.intersectObjects(
        core.diskMgr.object.children,
        true
      );
      for (let i = 0; i < io.length; i++) {
        const name = io[i].object.name;
        console.log(name);
        if (/^Disk-[wk]-\d+-\d+$/.test(name)) {
          const [, , x, y] = name.split("-").map((a) => +a);
          core.diskMgr.disks[y][x].flip();
          return;
        }
      }
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
