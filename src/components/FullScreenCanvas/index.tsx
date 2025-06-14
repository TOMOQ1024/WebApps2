import { Canvas } from "@react-three/fiber";
import { ReactNode } from "react";
import styles from "./index.module.scss";

interface FullScreenCanvasProps {
  children: ReactNode;
}

const FullScreenCanvas = ({ children }: FullScreenCanvasProps) => {
  return (
    <div className={styles.canvasContainer}>
      <Canvas gl={{ antialias: true }}>{children}</Canvas>
    </div>
  );
};

export default FullScreenCanvas;
