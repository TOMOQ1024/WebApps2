"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CanvasManager } from "@/src/CanvasManager";
import type GraphMgr from "@/src/GraphMgr";
import { vertexShader } from "../../compdynam/Shaders/VertexShader";
import { mandelbrotFragmentShader } from "../Shaders/MandelbrotFragment";

export const MANDEL_MATCH_MAX_ITER = 256;
export const MANDEL_MATCH_BASE_RADIUS = 2;
/** ターゲットは基準ビューに対して線形スケールでこの倍率で拡大 */
export const MANDEL_MATCH_ZOOM_FACTOR = 10;

type MandelCanvasProps = {
  graph: GraphMgr;
  onGraphChange?: (g: GraphMgr) => void;
  interactive: boolean;
  className?: string;
};

export default function MandelCanvas({
  graph,
  onGraphChange,
  interactive,
  className,
}: MandelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasManagerRef = useRef<CanvasManager | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const graphRef = useRef(graph);
  graphRef.current = graph;

  const [resolution, setResolution] = useState<THREE.Vector2>(() => {
    if (typeof window === "undefined") {
      return new THREE.Vector2(400, 400);
    }
    return new THREE.Vector2(400, 400);
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: 解像度変更時のみシーンを作り直し，graph は graphRef / updateGraph で同期する
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (canvasManagerRef.current) {
      canvasManagerRef.current.dispose();
    }

    const initial = new THREE.Vector2(
      Math.max(1, container.clientWidth),
      Math.max(1, container.clientHeight),
    );

    const canvasManager = new CanvasManager({
      container,
      resolution: initial,
      resizeSource: "container",
      graphManager: interactive ? graph : undefined,
      onGraphChange: interactive ? onGraphChange : undefined,
      onResolutionChange: (newResolution) => {
        setResolution(newResolution.clone());
      },
    });
    canvasManagerRef.current = canvasManager;

    const geometry = new THREE.PlaneGeometry(initial.x * 16, initial.y * 16);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uResolution: { value: initial.clone() },
        uGraph: {
          value: {
            origin: new THREE.Vector2(
              graphRef.current.origin.x,
              graphRef.current.origin.y,
            ),
            radius: graphRef.current.radius,
          },
        },
        uMaxIter: { value: MANDEL_MATCH_MAX_ITER },
      },
      vertexShader,
      fragmentShader: mandelbrotFragmentShader,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    canvasManager.getScene().add(mesh);

    canvasManager.startAnimation(() => {
      const m = materialRef.current;
      if (!m) return;
      const g = interactive
        ? canvasManager.getGraphManager()
        : graphRef.current;
      if (!g) return;
      m.uniforms.uGraph.value.origin.set(g.origin.x, g.origin.y);
      m.uniforms.uGraph.value.radius = g.radius;
      const size = new THREE.Vector2();
      canvasManager.getRenderer().getSize(size);
      m.uniforms.uResolution.value.copy(size);
    });

    return () => {
      canvasManager.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [resolution.x, resolution.y, interactive, onGraphChange]);

  useEffect(() => {
    if (canvasManagerRef.current && interactive) {
      canvasManagerRef.current.updateGraph(graph);
    }
  }, [graph, interactive]);

  return (
    <div
      ref={containerRef}
      className={
        className ?? "h-full w-full min-h-[200px] touch-none select-none"
      }
    />
  );
}
