"use client";

import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
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
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // window サイズを監視して Canvas サイズを更新
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();

    // 複数のイベントソースを監視
    window.addEventListener("resize", updateSize);
    window.visualViewport?.addEventListener("resize", updateSize);
    document.addEventListener("fullscreenchange", updateSize);

    // ResizeObserver で document.documentElement のサイズ変更を監視
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener("resize", updateSize);
      window.visualViewport?.removeEventListener("resize", updateSize);
      document.removeEventListener("fullscreenchange", updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  // サイズが 0 の場合はレンダリングしない（SSR 対応）
  if (canvasSize.width === 0 || canvasSize.height === 0) {
    return (
      <SharedCanvasContext.Provider value={{ containerRef }}>
        <div ref={containerRef} style={{ position: "relative" }}>
          {children}
        </div>
      </SharedCanvasContext.Provider>
    );
  }

  return (
    <SharedCanvasContext.Provider value={{ containerRef }}>
      <div ref={containerRef} style={{ position: "relative" }}>
        {children}
        <Canvas
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: canvasSize.width,
            height: canvasSize.height,
            pointerEvents: "none",
            zIndex: -1,
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
