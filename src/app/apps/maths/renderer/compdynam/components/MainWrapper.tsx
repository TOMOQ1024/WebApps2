"use client";
import { useEffect, useState } from "react";
import Core from "../Core";
import { Vector2 } from "three";

export default function MainWrapper() {
  const [core, setCore] = useState<Core>();

  useEffect(() => {
    if (!core) {
      const initCore = new Core();
      setCore(initCore);

      const onResize = () => {
        console.log("resized");
      };

      const HandlePointerDown = (e: PointerEvent) => {
        if (!initCore.controls) return;
        e.preventDefault();
        initCore.cvs.setPointerCapture(e.pointerId); // キャンバス外も追跡
        initCore.pointers.push({
          pointerId: e.pointerId,
          clientX: e.clientX,
          clientY: e.clientY,
        });
      };

      const HandlePointerMove = (e: PointerEvent) => {
        if (!initCore.controls) return;
        e.preventDefault();
        const rect = initCore.cvs.getBoundingClientRect();
        const m = Math.min(rect.width, rect.height);
        const pidx = initCore.pointers.findIndex(
          (p) => p.pointerId === e.pointerId
        );
        const p = initCore.pointers[pidx] ?? e;
        const c = initCore.pointers;
        switch (c.length) {
          case 0:
            return;
          case 1:
            let delta = new Vector2(
              (2 * (e.clientX - p.clientX)) / m,
              (2 * (p.clientY - e.clientY)) / m
            );
            initCore.graph.translate(delta.negate());
            break;
          default:
            const C0 = pidx === 0 ? e : c[0];
            const C1 = pidx === 1 ? e : c[1];
            let pOri = new Vector2(
              (((c[1].clientX + c[0].clientX) / rect.width - 1) * rect.width) /
                m,
              (((c[1].clientY + c[0].clientY) / rect.height - 1) *
                rect.height) /
                m
            );
            let dOri = new Vector2(
              (((C1.clientX + C0.clientX) / rect.width - 1) * rect.width) / m,
              (((C1.clientY + C0.clientY) / rect.height - 1) * rect.height) / m
            )
              .sub(pOri)
              .multiply({ x: 1, y: -1 });
            let pDelta = Math.hypot(
              (2 * (c[1].clientX - c[0].clientX)) / m,
              (2 * (c[1].clientY - c[0].clientY)) / m
            );
            let nDelta = Math.hypot(
              (2 * (C1.clientX - C0.clientX)) / m,
              (2 * (C1.clientY - C0.clientY)) / m
            );
            initCore.graph.translate(dOri.negate());
            initCore.graph.zoom(pOri.negate(), Math.log(pDelta / nDelta) * 500);
            break;
        }
        if (0 <= pidx) {
          initCore.pointers[pidx] = {
            pointerId: e.pointerId,
            clientX: e.clientX,
            clientY: e.clientY,
          };
        }
      };

      const HandlePointerUp = (e: PointerEvent) => {
        if (!initCore.controls) return;
        e.preventDefault();
        initCore.cvs.releasePointerCapture(e.pointerId);
        initCore.pointers.splice(
          initCore.pointers.findIndex((p) => p.pointerId === e.pointerId),
          1
        );
      };

      const cvs = initCore.cvs;
      (async () => {
        await initCore.init();

        cvs.addEventListener("pointerdown", HandlePointerDown, {
          passive: false,
        });
        cvs.addEventListener("pointermove", HandlePointerMove, {
          passive: false,
        });
        cvs.addEventListener("pointerup", HandlePointerUp, { passive: false });
        // document.addEventListener('wheel', HandleWheel, {passive: false});
        window.addEventListener("resize", onResize);
      })();
      return () => {
        initCore.endLoop();
        cvs.removeEventListener("pointerdown", HandlePointerDown);
        cvs.removeEventListener("pointermove", HandlePointerMove);
        cvs.removeEventListener("pointerup", HandlePointerUp);
        // document.removeEventListener('wheel', HandleWheel);
        window.removeEventListener("resize", onResize);
      };
    }
  }, [core]);

  return (
    <main id="main-wrapper">
      <canvas id="cvs" width={800} height={600}></canvas>
    </main>
  );
}
