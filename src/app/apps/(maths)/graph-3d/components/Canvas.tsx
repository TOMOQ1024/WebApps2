"use client";

import { useEffect, useRef } from "react";
import { type ExpressionMode, Graph3DCore } from "../core/Graph3DCore";
import type { RelationType } from "./Main";

interface CanvasProps {
  evalFunction: ((x: number, y: number, z?: number) => number) | null;
  mode: ExpressionMode;
  range: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin?: number;
    zMax?: number;
  };
  segments: number;
  wireframe: boolean;
  relationType: RelationType;
  onCoreReady: (core: Graph3DCore) => void;
}

export default function Canvas({
  evalFunction,
  mode,
  range,
  segments,
  wireframe,
  relationType,
  onCoreReady,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<Graph3DCore | null>(null);

  // Initialize core and handle resize
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create Graph3DCore instance
    const core = new Graph3DCore(canvasRef.current);
    coreRef.current = core;

    // Begin animation loop
    core.beginLoop();

    // Handle window resize
    const handleResize = () => {
      if (coreRef.current) {
        coreRef.current.resizeCanvas();
      }
    };

    window.addEventListener("resize", handleResize);

    // Call onCoreReady callback
    onCoreReady(core);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (coreRef.current) {
        coreRef.current.dispose();
        coreRef.current = null;
      }
    };
  }, [onCoreReady]);

  // Update surface when evalFunction, mode, range, segments, or relationType change
  useEffect(() => {
    if (coreRef.current && evalFunction) {
      if (mode === "explicit") {
        // z = f(x, y) mode
        coreRef.current.updateSurfaceExplicit(
          (x, y) => evalFunction(x, y),
          {
            xMin: range.xMin,
            xMax: range.xMax,
            yMin: range.yMin,
            yMax: range.yMax,
          },
          segments,
          relationType,
        );
      } else {
        // f(x, y, z) = 0 mode (implicit)
        coreRef.current.updateSurfaceImplicit(
          (x, y, z) => evalFunction(x, y, z),
          {
            xMin: range.xMin,
            xMax: range.xMax,
            yMin: range.yMin,
            yMax: range.yMax,
            zMin: range.zMin ?? -5,
            zMax: range.zMax ?? 5,
          },
          Math.min(segments, 32), // Limit segments for implicit (performance)
          relationType,
        );
      }
    }
  }, [evalFunction, mode, range, segments, relationType]);

  // Update wireframe mode
  useEffect(() => {
    if (coreRef.current) {
      coreRef.current.setWireframe(wireframe);
    }
  }, [wireframe]);

  return (
    <canvas ref={canvasRef} className="w-full h-full touch-none select-none" />
  );
}
