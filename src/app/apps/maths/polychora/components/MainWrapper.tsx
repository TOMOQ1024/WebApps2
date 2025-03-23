"use client";
import { useEffect, useState } from "react";
import Core from "../Core";
import { useSession } from "next-auth/react";
import Controls from "./Controls";
import { CreatePolychora } from "../Polychora";
import {
  AxesHelper,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
} from "three";
import style from "./MainWrapper.module.scss";

export default function MainWrapper() {
  const session = useSession();
  const [core, setCore] = useState<Core>();
  const [isFull, setIsFull] = useState(false);

  // const tab: {
  //   [key: string]: {
  //     A: number;
  //     C: [number, number];
  //     R: number;
  //   };
  // } = {};
  // const L = 20;
  // for (let A = 2; A <= L; A++) {
  //   for (let B = A; B <= L; B++) {
  //     for (let C = B; C <= L; C++) {
  //       if ((B * C + C * A + A * B) / A / B / C >= 1) continue;
  //       console.log(A, B, C);
  //       const v = h2t_solve(A, B, C);
  //       const p = new Vector2(v.x, 0);
  //       const q = new Vector2(
  //         Math.cos(Math.PI / A),
  //         Math.sin(Math.PI / A)
  //       ).multiplyScalar(v.y);
  //       const i = h2t_i(p, q);
  //       const j = h2t_j(p, q);
  //       const k = h2t_k(p, q);
  //       tab[`${A} ${B} ${C}`] = {
  //         A,
  //         C: new Vector2(i, j).divideScalar(2 * k).toArray(),
  //         R: Math.sqrt((i * i + j * j) / (4 * k * k) - 1),
  //       };
  //     }
  //   }
  // }
  // console.log(tab);

  useEffect(() => {
    if (!core) {
      const initCore = new Core(
        document.getElementById("cvs") as HTMLCanvasElement
      );
      setCore(initCore);

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

        if (e.key === "p" && !e.shiftKey && !e.metaKey && tagName !== "INPUT") {
          // 3,3,2,xxo,false
          // 4,3,2,xoo
          // initCore.scene.add(new AxesHelper());
          const [ma, mb, mc, ni] = [3, 5, 2, "sss"];
          const g0 = CreatePolychora(ma, mb, mc, ni, !true)!.scale(
            0.2,
            0.2,
            0.2
          );
          initCore.scene.add(
            new LineSegments(
              new EdgesGeometry(g0),
              new LineBasicMaterial({ color: 0x00ffff })
            )
          );

          const g = CreatePolychora(ma, mb, mc, ni, true)!.scale(0.2, 0.2, 0.2);
          initCore.scene.add(
            new Mesh(
              g,
              new MeshLambertMaterial({
                color: 0,
                opacity: 0.9,
                transparent: true,
              })
            )
          );
          initCore.scene.add(
            new LineSegments(
              new EdgesGeometry(g),
              new LineBasicMaterial({ color: 0xffff00 })
            )
          );
        }
      };

      (async () => {
        await initCore.init(true);

        document.addEventListener("keydown", HandleKeyDown);
        window.addEventListener("resize", HandleResize);
        // document.addEventListener("contextmenu", preventDefault, {
        //   passive: false,
        // });
      })();
      return () => {
        initCore.endLoop();
        document.removeEventListener("keydown", HandleKeyDown);
        window.removeEventListener("resize", HandleResize);
        // document.removeEventListener("contextmenu", preventDefault);
      };
    }
  }, [core, session]);

  return (
    <main className={style.main}>
      <Controls core={core} />
      <canvas id="cvs" width={800} height={600}></canvas>
    </main>
  );
}
