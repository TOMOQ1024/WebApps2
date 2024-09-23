"use client";
import { useEffect, useState } from "react";
import Core from "../Core";
import { Vector2 } from "three";
import Controls from "./Controls";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import preventDefault from "@/src/preventDefault";

export default function MainWrapper() {
  const session = useSession();
  const searchParams = useSearchParams();
  const [core, setCore] = useState<Core>();
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    if (searchParams) {
      let v = searchParams.get("nessy");
      if (v !== null && core) {
        core.nessyMode = true;
      }
    }

    if (!core) {
      const initCore = new Core();
      setCore(initCore);

      if (searchParams) {
        let v = searchParams.get("nessy");
        if (v !== null) {
          initCore.nessyMode = true;
        }
      }

      const HandleResize = () => {
        initCore.resizeCanvas();
      };

      const HandleKeyDown = (e: KeyboardEvent) => {
        // フルスクリーン切り替え
        const tagName = (e.target as HTMLElement).tagName;
        if (e.key === "f" && !e.shiftKey && !e.metaKey && tagName !== "INPUT") {
          const wr = initCore.cvs.parentElement!;
          if (!document.fullscreenElement) {
            setIsFull(true);
            wr.requestFullscreen();
            HandleResize();
          } else {
            setIsFull(false);
            document.exitFullscreen();
            HandleResize();
          }
        }
        if (session && e.key === ";" && !e.shiftKey && !e.metaKey) {
          const data = {
            authorId: 1,
            z0Expression: initCore.z0expr,
            expression: initCore.funcexpr,
            radius: initCore.graph.radius,
            originX: initCore.graph.origin.x,
            originY: initCore.graph.origin.y,
            tags: [],
          };
          (async () => {
            const response = await axios.post("/api/works/create", data);
            console.log(response);
          })();
        }
        if (0 && e.key === "v" && !e.shiftKey && !e.metaKey) {
          // 仮
          const ipt = document.querySelector("#func-input") as HTMLInputElement;
          console.log(ipt);

          const stream = initCore.cvs.captureStream();
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
          ipt.value = `z^2+mix(c,-z,0.00)`;
          ipt.click();
          recorder.start();

          let t = 0;
          const itv = setInterval(() => {
            const T = t * t * (3 - 2 * t);

            ipt.value = `z^2+mix(c,-z,${T})`;
            ipt.click();
            // ipt.innerHTML = `z^2+mix(c,-0.2-0.7i,${T.toFixed(2)})`;
            ipt.value = `z^2+mix(c,-z,${T.toFixed(2)})`;

            if (1 < t) {
              clearInterval(itv);
              recorder.stop();
            }

            t += 0.005;
          }, 100);
        }
      };

      const HandleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (!initCore.controls) return;
        const rect = initCore.cvs.getBoundingClientRect();
        // [0,1]正規化した座標
        const m = Math.min(rect.width, rect.height);
        const c = new Vector2(
          (((2 * (e.clientX - rect.left)) / rect.width - 1) * rect.width) / m,
          (((2 * (e.clientY - rect.top)) / rect.height - 1) * rect.height) / m
        );
        const dy = e.deltaY;
        initCore.graph.zoom(c.negate(), dy);
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

        document.addEventListener("keydown", HandleKeyDown);
        cvs.addEventListener("pointerdown", HandlePointerDown, {
          passive: false,
        });
        cvs.addEventListener("pointermove", HandlePointerMove, {
          passive: false,
        });
        cvs.addEventListener("pointerup", HandlePointerUp, { passive: false });
        cvs.addEventListener("wheel", HandleWheel, { passive: false });
        window.addEventListener("resize", HandleResize);
        document.addEventListener("contextmenu", preventDefault, {
          passive: false,
        });
      })();
      return () => {
        initCore.endLoop();
        document.removeEventListener("keydown", HandleKeyDown);
        cvs.removeEventListener("pointerdown", HandlePointerDown);
        cvs.removeEventListener("pointermove", HandlePointerMove);
        cvs.removeEventListener("pointerup", HandlePointerUp);
        cvs.removeEventListener("wheel", HandleWheel);
        window.removeEventListener("resize", HandleResize);
        document.removeEventListener("contextmenu", preventDefault);
      };
    }
  }, [core, searchParams, session]);

  return (
    <main id="main-wrapper">
      <Controls core={core} />
      <canvas id="cvs" width={800} height={600}></canvas>
    </main>
  );
}
