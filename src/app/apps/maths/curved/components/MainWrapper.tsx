"use client";
import { useEffect, useState } from "react";
import Core from "../Core";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import preventDefault from "@/src/preventDefault";

export default function MainWrapper() {
  const session = useSession();
  const searchParams = useSearchParams();
  const [core, setCore] = useState<Core>();
  const [isFull, setIsFull] = useState(false);

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
      };

      (async () => {
        await initCore.init();

        document.addEventListener("keydown", HandleKeyDown);
        window.addEventListener("resize", HandleResize);
        document.addEventListener("contextmenu", preventDefault, {
          passive: false,
        });
      })();
      return () => {
        initCore.endLoop();
        document.removeEventListener("keydown", HandleKeyDown);
        window.removeEventListener("resize", HandleResize);
        document.removeEventListener("contextmenu", preventDefault);
      };
    }
  }, [core, session]);

  return (
    <main id="main-wrapper">
      <canvas id="cvs" width={800} height={600}></canvas>
    </main>
  );
}
