import { useEffect, useRef, useState } from "react";
import Core from "../core/Core";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";
import styles from "./Canvas.module.scss";

export interface CanvasProps {
  core: Core | undefined;
  setCore: (core: Core) => void;
  diagram: CoxeterDynkinDiagram;
}

export default function Canvas({ core, setCore, diagram }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const newCore = new Core(canvas);
    setCore(newCore);

    const handleResize = () => {
      newCore.resizeCanvas();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // フルスクリーン切り替え
      const tagName = (e.target as HTMLElement).tagName;
      if (e.key === "f" && !e.shiftKey && !e.metaKey && tagName !== "INPUT") {
        const wr = newCore.cvs.parentElement!;
        if (!document.fullscreenElement) {
          setIsFull(true);
          wr.requestFullscreen();
          handleResize();
        } else {
          setIsFull(false);
          document.exitFullscreen();
          handleResize();
        }
      }

      if (e.key === "e" && !e.shiftKey && !e.metaKey && tagName !== "INPUT") {
        newCore.downloadGLB();
      }
      if (e.key === "p" && !e.shiftKey && !e.metaKey && tagName !== "INPUT") {
        (async () => {
          await newCore.setPolychoron();
        })();
      }
    };

    newCore.init(true);

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      newCore.endLoop();
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [setCore]);

  // diagramが変更された時にcoreのdiagramを更新
  useEffect(() => {
    if (core) {
      core.diagram = diagram;
    }
  }, [core, diagram]);

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={styles.canvas}
      />
    </div>
  );
}
