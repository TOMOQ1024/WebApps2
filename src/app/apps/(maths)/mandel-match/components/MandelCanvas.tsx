"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CanvasManager } from "@/shared/graph/CanvasManager";
import type GraphMgr from "@/shared/graph/GraphMgr";
import { vertexShader } from "../../compdynam/Shaders/VertexShader";
import { mandelbrotFragmentShader } from "../Shaders/MandelbrotFragment";

export const MANDEL_MATCH_MAX_ITER = 256;
export const MANDEL_MATCH_BASE_RADIUS = 2;
/** ターゲットは基準ビューに対して線形スケールでこの倍率で拡大 */
export const MANDEL_MATCH_ZOOM_FACTOR = 10;

export type MandelResultTint =
  | "default"
  | "green"
  | "orange"
  | "red"
  | "yellow";

const TINT_RGB_SCRATCH = new THREE.Vector3(1, 1, 1);
/** シェーダの resultTintRgb と同値（毎フレームの補間用に out に書き込む） */
function setMandelResultTintRgb(t: MandelResultTint, out: THREE.Vector3): void {
  switch (t) {
    case "green":
      out.set(0.52, 0.92, 0.55);
      return;
    case "orange":
      out.set(0.98, 0.56, 0.2);
      return;
    case "red":
      out.set(0.95, 0.32, 0.32);
      return;
    case "yellow":
      out.set(0.96, 0.84, 0.26);
      return;
    default:
      out.set(1, 1, 1);
  }
}

/** 1 フレームあたりの目標色・強度への追従（大きいほど速い） */
const TINT_LERP = 0.22;

type MandelCanvasProps = {
  graph: GraphMgr;
  onGraphChange?: (g: GraphMgr) => void;
  interactive: boolean;
  className?: string;
  /** 操作側の採点結果に応じた着色（既定はそのまま） */
  resultTint?: MandelResultTint;
};

export default function MandelCanvas({
  graph,
  onGraphChange,
  interactive,
  className,
  resultTint = "default",
}: MandelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasManagerRef = useRef<CanvasManager | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const graphRef = useRef(graph);
  graphRef.current = graph;
  const resultTintRef = useRef(resultTint);
  resultTintRef.current = resultTint;
  const tintRgbAnimatedRef = useRef(new THREE.Vector3(1, 1, 1));
  const tintStrengthAnimatedRef = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: graph は graphRef / updateGraph で同期．リサイズは CanvasManager 内で処理し WebGL は作り直さない
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
        uTintRgb: { value: new THREE.Vector3(1, 1, 1) },
        uTintStrength: { value: 0 },
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
      const tint = resultTintRef.current;
      setMandelResultTintRgb(tint, TINT_RGB_SCRATCH);
      const targetStrength = tint === "default" ? 0 : 1;
      tintRgbAnimatedRef.current.lerp(TINT_RGB_SCRATCH, TINT_LERP);
      tintStrengthAnimatedRef.current = THREE.MathUtils.clamp(
        tintStrengthAnimatedRef.current +
          (targetStrength - tintStrengthAnimatedRef.current) * TINT_LERP,
        0,
        1,
      );
      m.uniforms.uTintRgb.value.copy(tintRgbAnimatedRef.current);
      m.uniforms.uTintStrength.value = tintStrengthAnimatedRef.current;
      const size = new THREE.Vector2();
      canvasManager.getRenderer().getSize(size);
      m.uniforms.uResolution.value.copy(size);
    });

    return () => {
      canvasManager.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [interactive, onGraphChange]);

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
