import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { vertexShader } from "../Shaders/VertexShader";
import GraphMgr from "@/src/GraphMgr";
import styles from "./Canvas.module.scss";
import { CanvasManager } from "@/src/CanvasManager";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";

interface CanvasProps {
  shader: string;
  graph: GraphMgr;
  diagram: CoxeterDynkinDiagram;
  onGraphChange: (graph: GraphMgr) => void;
}

export default function Canvas({
  shader,
  graph,
  diagram,
  onGraphChange,
}: CanvasProps) {
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
      onGraphChange: (graph) => {
        onGraphChange(graph);
        if (materialRef.current) {
          materialRef.current.uniforms.uGraph.value.origin.set(
            graph!.origin.x,
            graph!.origin.y
          );
          materialRef.current.uniforms.uGraph.value.radius = graph!.radius;
        }
      },
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
            radius: 1,
          },
        },
        uDiagram: {
          value: {
            ma: diagram.labels.bc[0] / diagram.labels.bc[1],
            mb: diagram.labels.ca[0] / diagram.labels.ca[1],
            mc: diagram.labels.ab[0] / diagram.labels.ab[1],
            na: diagram.nodeMarks.a === "x" ? 1 : 0,
            nb: diagram.nodeMarks.b === "x" ? 1 : 0,
            nc: diagram.nodeMarks.c === "x" ? 1 : 0,
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
      }
    });

    return () => {
      canvasManager.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [shader, resolution, onGraphChange]);

  useEffect(() => {
    if (canvasManagerRef.current) {
      canvasManagerRef.current.updateGraph(graph);
    }
  }, [graph]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uDiagram.value.ma =
        diagram.labels.bc[0] / diagram.labels.bc[1];
      materialRef.current.uniforms.uDiagram.value.mb =
        diagram.labels.ca[0] / diagram.labels.ca[1];
      materialRef.current.uniforms.uDiagram.value.mc =
        diagram.labels.ab[0] / diagram.labels.ab[1];
      materialRef.current.uniforms.uDiagram.value.na =
        diagram.nodeMarks.a === "x" ? 1 : 0;
      materialRef.current.uniforms.uDiagram.value.nb =
        diagram.nodeMarks.b === "x" ? 1 : 0;
      materialRef.current.uniforms.uDiagram.value.nc =
        diagram.nodeMarks.c === "x" ? 1 : 0;
    }
    console.log(diagram.labels.bc, diagram.labels.ca, diagram.labels.ab);
  }, [diagram]);

  return <div ref={containerRef} className={styles.canvasContainer} />;
}
