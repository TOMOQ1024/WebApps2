"use client";
import { useEffect, useState } from "react";
import Core from "../Core";
import { useSession } from "next-auth/react";
import Controls from "./Controls";
import { CreatePolychora } from "../Polychora";
import { DoubleSide, Mesh, RawShaderMaterial, Vector3 } from "three";
import style from "./MainWrapper.module.scss";
import { GyrovectorSpace3 } from "@/src/maths/GyrovectorSpace3";

export default function MainWrapper() {
  const session = useSession();
  const [core, setCore] = useState<Core>();
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    console.log("aa");
    if (!core) {
      const initCore = new Core(
        document.getElementById("cvs") as HTMLCanvasElement
      );
      setCore(initCore);

      const OnResize = () => {
        HandleResize(initCore);
      };

      const OnKeyDown = (e: KeyboardEvent) => {
        HandleKeyDown(initCore, setIsFull, HandleResize, e);
      };

      initCore.init(true);

      document.addEventListener("keydown", OnKeyDown);
      window.addEventListener("resize", OnResize);
      // document.addEventListener("contextmenu", preventDefault, {
      //   passive: false,
      // });
      return () => {
        console.log("bb");
        initCore.endLoop();
        document.removeEventListener("keydown", OnKeyDown);
        window.removeEventListener("resize", OnResize);
        // document.removeEventListener("contextmenu", preventDefault);
      };
    } else {
      const OnResize = () => {
        HandleResize(core);
      };

      const OnKeyDown = (e: KeyboardEvent) => {
        HandleKeyDown(core, setIsFull, HandleResize, e);
      };

      core.init(true);

      document.addEventListener("keydown", OnKeyDown);
      window.addEventListener("resize", OnResize);
      // document.addEventListener("contextmenu", preventDefault, {
      //   passive: false,
      // });
      return () => {
        console.log("bb");
        core.endLoop();
        document.removeEventListener("keydown", OnKeyDown);
        window.removeEventListener("resize", OnResize);
        // document.removeEventListener("contextmenu", preventDefault);
      };
    }
  }, [core, session]);

  return (
    <main className={style.main}>
      {/* <Controls core={core} /> */}
      <canvas id="cvs" width={800} height={600}></canvas>
    </main>
  );
}

const HandleResize = (core: Core) => {
  core.resizeCanvas();
};

const HandleKeyDown = (
  core: Core,
  setIsFull: (b: boolean) => any,
  handleResize: (c: Core) => any,
  e: KeyboardEvent
) => {
  // フルスクリーン切り替え
  const tagName = (e.target as HTMLElement).tagName;
  if (e.key === "f" && !e.shiftKey && !e.metaKey && tagName !== "INPUT") {
    const wr = core.cvs.parentElement!;
    if (!document.fullscreenElement) {
      setIsFull(true);
      wr.requestFullscreen();
      HandleResize(core);
    } else {
      setIsFull(false);
      document.exitFullscreen();
      HandleResize(core);
    }
  }

  if (e.key === "t" && !e.shiftKey && !e.metaKey && tagName !== "INPUT") {
    // gyrovector3 test
    console.log("gyrovector3 test");

    const g = new GyrovectorSpace3();
    console.log(
      g.reflect(
        new Vector3(0, 0, 0.5463024898437905),
        new Vector3(0, 0, 0.1),
        new Vector3(0.5463024898437905, 0, 0),
        new Vector3(0, 0.5463024898437905, 0)
      )
    );
  }
  if (e.key === "e" && !e.shiftKey && !e.metaKey && tagName !== "INPUT") {
    core.downloadGLB();
  }
  if (e.key === "p" && !e.shiftKey && !e.metaKey && tagName !== "INPUT") {
    const labels = {
      ab: [2, 1],
      bc: [5, 1],
      cd: [2, 1],
      da: [5, 1],
      ac: [2, 1],
      bd: [2, 1],
    } as { [genPair: string]: [number, number] };
    const ni = {
      a: "x",
      b: "o",
      c: "x",
      d: "o",
    };
    (async () => {
      const g0 = (await CreatePolychora(labels, ni, !true))!;
      core.setPolychoron(g0);
    })();
  }
};
