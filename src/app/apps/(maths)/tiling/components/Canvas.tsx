import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { vertexShader } from "../Shaders/VertexShader";
import GraphMgr from "@/src/GraphMgr";
import styles from "./Canvas.module.scss";
import { CanvasManager } from "@/src/CanvasManager";

interface CanvasProps {
  shader: string;
  graph: GraphMgr;
  onGraphChange: (graph: GraphMgr) => void;
}

export default function Canvas({ shader, graph, onGraphChange }: CanvasProps) {
  const [resolution, setResolution] = useState<THREE.Vector2>(() => {
    // サーバーサイドレンダリング時はデフォルト値を使用
    if (typeof window === "undefined") {
      return new THREE.Vector2(800, 600);
    }
    // クライアントサイドではウィンドウサイズを使用
    return new THREE.Vector2(window.innerWidth, window.innerHeight - 50);
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasManagerRef = useRef<CanvasManager | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  // クライアントサイドでの初期サイズ設定
  useEffect(() => {
    const newResolution = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight - 50
    );
    setResolution(newResolution);
  }, []);

  // シーンの初期化
  useEffect(() => {
    if (!containerRef.current) return;

    // 既存のキャンバスをクリーンアップ
    if (canvasManagerRef.current) {
      canvasManagerRef.current.dispose();
    }

    const canvasManager = new CanvasManager({
      container: containerRef.current,
      resolution,
      onGraphChange,
      graphManager: graph,
      onResolutionChange: (newResolution) => {
        setResolution(newResolution);
      },
    });
    canvasManagerRef.current = canvasManager;

    const geometry = new THREE.PlaneGeometry(
      resolution.x * 16,
      resolution.y * 16
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: resolution,
        },
        uGraph: {
          value: {
            origin: new THREE.Vector2(0, 0),
            radius: 2,
          },
        },
      },
      vertexShader: vertexShader,
      fragmentShader: shader,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    canvasManager.getScene().add(mesh);

    canvasManager.startAnimation((time) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = time * 0.001;
        const graph = canvasManager.getGraphManager();
        materialRef.current.uniforms.uGraph.value.origin.set(
          graph!.origin.x,
          graph!.origin.y
        );
        materialRef.current.uniforms.uGraph.value.radius = graph!.radius;
      }
    });

    return () => {
      canvasManager.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [shader, resolution, graph, onGraphChange]);

  // graphの変更を監視
  useEffect(() => {
    if (canvasManagerRef.current) {
      canvasManagerRef.current.updateGraph(graph);
    }
  }, [graph]);

  return <div ref={containerRef} className={styles.canvasContainer} />;
}
