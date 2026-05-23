import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

interface FullScreenCanvasProps {
  children: ReactNode;
}

const FullScreenCanvas = ({ children }: FullScreenCanvasProps) => {
  return (
    <div className="fixed top-[var(--header-height)] left-0 w-screen h-[calc(100vh-var(--header-height))] z-0">
      <Canvas gl={{ antialias: true }}>{children}</Canvas>
    </div>
  );
};

export default FullScreenCanvas;
