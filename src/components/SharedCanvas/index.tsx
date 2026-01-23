"use client";

import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useRef,
} from "react";

type SharedCanvasContextType = {
  containerRef: RefObject<HTMLDivElement | null>;
};

const SharedCanvasContext = createContext<SharedCanvasContextType | null>(null);

export function useSharedCanvas() {
  const ctx = useContext(SharedCanvasContext);
  if (!ctx) {
    throw new Error("useSharedCanvas must be used within SharedCanvasProvider");
  }
  return ctx;
}

interface SharedCanvasProviderProps {
  children: ReactNode;
}

export function SharedCanvasProvider({ children }: SharedCanvasProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <SharedCanvasContext.Provider value={{ containerRef }}>
      <div ref={containerRef} style={{ position: "relative" }}>
        {children}
        <Canvas
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 5000,
          }}
          gl={{ alpha: true }}
          eventSource={containerRef as RefObject<HTMLDivElement>}
          eventPrefix="client"
        >
          <View.Port />
        </Canvas>
      </div>
    </SharedCanvasContext.Provider>
  );
}

export { View };
