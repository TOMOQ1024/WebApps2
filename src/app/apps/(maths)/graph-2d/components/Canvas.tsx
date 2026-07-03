import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as THREE from "three";
import { vertexShader } from "../Shaders/VertexShader";
import type GraphMgr from "@/shared/graph/GraphMgr";
import { CanvasManager } from "@/shared/graph/CanvasManager";
import { useTheme } from "@/hooks/useTheme";

interface CanvasProps {
  shader: string;
  graph: GraphMgr;
  onGraphChange: (graph: GraphMgr) => void;
  renderMode: number;
  exprType: number;
}

export interface CanvasHandle {
  captureSquareThumbnail: (size?: number) => string | null;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas(
  { shader, graph, onGraphChange, renderMode, exprType },
  ref,
) {
  const { themeValue } = useTheme();
  const themeValueRef = useRef(themeValue);

  // themeValue を ref に同期
  useEffect(() => {
    themeValueRef.current = themeValue;
  }, [themeValue]);

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
      window.innerHeight - 50,
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
      resolution.y * 16,
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTheme: { value: themeValueRef.current },
        uResolution: {
          value: resolution,
        },
        uGraph: {
          value: {
            origin: new THREE.Vector2(0, 0),
            radius: 2,
          },
        },
        uRenderMode: { value: renderMode },
        uExprType: { value: exprType },
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
        materialRef.current.uniforms.uTheme.value = themeValueRef.current;
        const currentGraph = canvasManager.getGraphManager();
        if (currentGraph) {
          materialRef.current.uniforms.uGraph.value.origin.set(
            currentGraph.origin.x,
            currentGraph.origin.y,
          );
          materialRef.current.uniforms.uGraph.value.radius =
            currentGraph.radius;
        }
      }
    });

    return () => {
      canvasManager.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [shader, resolution, renderMode, exprType, graph, onGraphChange]);

  // graphの変更を監視
  useEffect(() => {
    if (canvasManagerRef.current) {
      canvasManagerRef.current.updateGraph(graph);
    }
  }, [graph]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uRenderMode.value = renderMode;
    }
  }, [renderMode]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uExprType.value = exprType;
    }
  }, [exprType]);

  // 正方形サムネイルをキャプチャする関数を親に公開
  useImperativeHandle(
    ref,
    () => ({
      captureSquareThumbnail: (size = 256): string | null => {
        const canvasManager = canvasManagerRef.current;
        if (!canvasManager) return null;

        const renderer = canvasManager.getRenderer();
        const domElement = renderer.domElement;

        // キャンバスの中心から正方形を切り出す
        const canvasWidth = domElement.width;
        const canvasHeight = domElement.height;
        const cropSize = Math.min(canvasWidth, canvasHeight);
        const offsetX = Math.floor((canvasWidth - cropSize) / 2);
        const offsetY = Math.floor((canvasHeight - cropSize) / 2);

        // 一時的なキャンバスを作成して正方形にクロップ
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = size;
        tempCanvas.height = size;
        const ctx = tempCanvas.getContext("2d");
        if (!ctx) return null;

        ctx.drawImage(
          domElement,
          offsetX,
          offsetY,
          cropSize,
          cropSize,
          0,
          0,
          size,
          size,
        );

        return tempCanvas.toDataURL("image/png");
      },
    }),
    [],
  );

  return (
    <div
      ref={containerRef}
      className="left-0 w-full h-full z-0 touch-none select-none"
    />
  );
});

export default Canvas;
