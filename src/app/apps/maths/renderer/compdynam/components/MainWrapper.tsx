"use client";
import { Suspense, useEffect, useState } from "react";
import CDCore from "../CompDynamCore";
import Controls from "./Controls";
import GraphWrapper from "./GraphWrapper";
import { useSearchParams } from "next/navigation";
import { Vector2 } from "three";

function _MainWrapper() {
  const searchParams = useSearchParams();
  const [core, setCore] = useState(new CDCore());
  useEffect(() => {
    (async () => {
      if (searchParams) {
        let v = searchParams.get("nessy");
        if (v !== null) {
          core.nessyMode = true;
        }
      }
      await core.init();
      core.beginLoop();

      const onKeyDown = (e: KeyboardEvent) => {
        // フルスクリーン切り替え
        if (e.key === "f" && !e.shiftKey && !e.metaKey) {
          if (!document.fullscreenElement) {
            core.glmgr.cvs!.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }
        if (0 && e.key === "v" && !e.shiftKey && !e.metaKey) {
          // 仮
          const ipt = document.querySelector("#func-input") as HTMLSpanElement;

          const stream = core.glmgr.cvs!.captureStream();
          const recorder = new MediaRecorder(stream, {
            mimeType: "video/mp4",
            videoBitsPerSecond: 2500000,
          });
          const anchor = document.createElement("a");
          anchor.innerText = "download";
          anchor.style.display = "none";
          ipt.parentNode?.appendChild(anchor);

          recorder.ondataavailable = (e) => {
            const videoBlob = new Blob([e.data], { type: e.data.type });
            const blobUrl = window.URL.createObjectURL(videoBlob);
            anchor.download = "movie.mp4";
            anchor.href = blobUrl;
            anchor.style.display = "block";
          };

          // const C1 = '-0.2-0.7i';// c
          const C1 = "-0.63i";
          // const C2 = '-0.2-0.7i';
          // const C2 = '-0.6-0.42i';
          const C2 = "-0.8";
          ipt.innerHTML = `z^2+mix(${C1},${C2},${0.0})`;
          ipt.click();
          recorder.start();

          let t = 0;
          const itv = setInterval(() => {
            const T = t * t * (3 - 2 * t);

            ipt.innerHTML = `z^2+mix(${C1},${C2},${T})`;
            ipt.click();
            // ipt.innerHTML = `z^2+mix(c,-0.2-0.7i,${T.toFixed(2)})`;
            ipt.innerHTML = `z^2+mix(${C1},${C2},${T.toFixed(2)})`;

            if (1 < t) {
              clearInterval(itv);
              recorder.stop();
            }

            t += 0.005;
          }, 100);
        }
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        // console.log(e);
        const rect = core.glmgr.cvs!.getBoundingClientRect();
        // [0,1]正規化した座標
        const m = Math.min(rect.width, rect.height);
        const c = new Vector2(
          (((2 * (e.clientX - rect.left)) / rect.width - 1) * rect.width) / m,
          (((2 * (e.clientY - rect.top)) / rect.height - 1) * rect.height) / m
        );
        const dy = e.deltaY;
        core.graph.zoom(c.negate(), dy);

        core.glmgr.updateGraphUniform();

        core.glmgr.render();
      };

      const onPointerDown = (e: PointerEvent) => {
        if (!core.controls) return;
        e.preventDefault();
        core.glmgr.cvs!.setPointerCapture(e.pointerId); // キャンバス外も追跡
        core.pointers.push({
          pointerId: e.pointerId,
          clientX: e.clientX,
          clientY: e.clientY,
        });
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!core.controls) return;
        e.preventDefault();
        const rect = core.glmgr.cvs!.getBoundingClientRect();
        const m = Math.min(rect.width, rect.height);
        const pidx = core.pointers.findIndex(
          (p) => p.pointerId === e.pointerId
        );
        const p = core.pointers[pidx] ?? e;
        const c = core.pointers;
        switch (c.length) {
          case 0:
            return;
          case 1:
            let delta = new Vector2(
              (2 * (e.clientX - p.clientX)) / m,
              (2 * (p.clientY - e.clientY)) / m
            );
            core.graph.translate(delta.negate());
            core.glmgr.updateGraphUniform();
            core.glmgr.render();
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
            core.graph.translate(dOri.negate());
            core.graph.zoom(pOri.negate(), Math.log(pDelta / nDelta) * 500);
            core.glmgr.updateGraphUniform();
            core.glmgr.render();
            break;
        }
        if (0 <= pidx) {
          core.pointers[pidx] = {
            pointerId: e.pointerId,
            clientX: e.clientX,
            clientY: e.clientY,
          };
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!core.controls) return;
        e.preventDefault();
        core.glmgr.cvs!.releasePointerCapture(e.pointerId);
        core.pointers.splice(
          core.pointers.findIndex((p) => p.pointerId === e.pointerId),
          1
        );
      };

      const onResize = () => {
        core.resizeCanvas();
      };

      document.addEventListener("keydown", onKeyDown);
      core.glmgr.cvs!.addEventListener("wheel", onWheel, { passive: false });
      core.glmgr.cvs!.addEventListener("pointerdown", onPointerDown, {
        passive: false,
        capture: true,
      });
      core.glmgr.cvs!.addEventListener("pointermove", onPointerMove, {
        passive: false,
        capture: true,
      });
      core.glmgr.cvs!.addEventListener("pointerup", onPointerUp, {
        passive: false,
      });
      window.addEventListener("resize", onResize);
      return () => {
        core.endLoop();
        console.log("e");
        document.removeEventListener("keydown", onKeyDown);
        core.glmgr.cvs!.removeEventListener("wheel", onWheel);
        core.glmgr.cvs!.removeEventListener("pointerdown", onPointerDown);
        core.glmgr.cvs!.removeEventListener("pointermove", onPointerMove);
        core.glmgr.cvs!.removeEventListener("pointerup", onPointerUp);
        // document.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener("resize", onResize);
      };
    })();
  }, [core, searchParams]);

  return (
    <main id="main-wrapper">
      <GraphWrapper />
      <Controls core={core} />
    </main>
  );
}

export default function MainWrapper() {
  return (
    <Suspense>
      <_MainWrapper />
    </Suspense>
  );
}
