"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { fragmentShader as baseFragmentShader } from "@/app/apps/(maths)/compdynam/Shaders/FragmentShader";
import { vertexShader as baseVertexShader } from "@/app/apps/(maths)/compdynam/Shaders/VertexShader";
import { latexToComplexGLSL } from "@/src/Parser/latexToComplexGLSL";
import styles from "./Main.module.scss";
import { CompDynamGalleryItem } from "@/app/galleries/compdynam/GalleryData";
import { useRouter } from "next/navigation";

interface GalleryGridCanvasProps {
  items: CompDynamGalleryItem[];
  className?: string;
}

const CELL_SIZE = 100; // px 固定
const PADDING = 40; // px, キャンバス内余白

export default function GalleryGridCanvas({
  items,
  className,
}: GalleryGridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [cols, setCols] = useState(1);
  const [rows, setRows] = useState(1);
  const [, forceUpdate] = useState(false);
  const hoverIdxRef = useRef<number | null>(null);
  const router = useRouter();

  // Three.js関連のrefs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const eventHandlersRef = useRef<{
    handlePointerMove: (e: MouseEvent) => void;
    handlePointerLeave: () => void;
    handleClick: (e: MouseEvent) => void;
  } | null>(null);

  // 親要素の幅からcols/rows/canvasSizeを自動計算
  useEffect(() => {
    function updateGrid() {
      if (!containerRef.current) return;
      const parentRect = containerRef.current.getBoundingClientRect();
      const width = parentRect.width;
      const cols = Math.max(1, Math.floor(width / CELL_SIZE));
      const rows = Math.ceil(items.length / cols);
      setCols(cols);
      setRows(rows);
      setCanvasSize({ width, height: rows * CELL_SIZE + PADDING * 2 });
    }
    updateGrid();
    window.addEventListener("resize", updateGrid);
    return () => window.removeEventListener("resize", updateGrid);
  }, [items.length]);

  // リサイズ時のキャンバスサイズ変更とメッシュレイアウト更新
  useEffect(() => {
    if (
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current ||
      !containerRef.current
    )
      return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const width = parentRect.width;
    const cols = Math.max(1, Math.floor(width / CELL_SIZE));
    const rows = Math.ceil(items.length / cols);
    const height = rows * CELL_SIZE + PADDING * 2;

    if (width === 0 || height === 0) return;

    // レンダラーサイズ更新
    rendererRef.current.setSize(width, height);

    // カメラ更新
    cameraRef.current.left = -width / 2;
    cameraRef.current.right = width / 2;
    cameraRef.current.top = height / 2;
    cameraRef.current.bottom = -height / 2;
    cameraRef.current.updateProjectionMatrix();

    // グリッド配置
    const gridW = width - PADDING * 2;
    const gridH = height - PADDING * 2;
    const cellW = gridW / cols;
    const cellH = CELL_SIZE;
    const cellSize = Math.min(cellW, cellH) * 0.9;

    // メッシュの位置更新
    meshesRef.current.forEach((mesh, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      mesh.position.x = -width / 2 + PADDING + cellW * (col + 0.5);
      mesh.position.y = height / 2 - PADDING - cellH * (row + 0.5);
      mesh.userData = { ...mesh.userData, row, col, idx };
    });

    // マウスイベントハンドラーを更新
    if (rendererRef.current && eventHandlersRef.current) {
      const renderer = rendererRef.current;
      const { handlePointerMove, handlePointerLeave, handleClick } =
        eventHandlersRef.current;

      // 既存のイベントリスナーを削除
      renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      renderer.domElement.removeEventListener("mouseleave", handlePointerLeave);
      renderer.domElement.removeEventListener("click", handleClick);

      // 新しいイベントハンドラーを作成
      const getCellIndexFromPointer = (e: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        const wx = (x * width) / 2;
        const wy = (y * height) / 2;
        // パディング内か判定
        if (
          wx < -width / 2 + PADDING ||
          wx > width / 2 - PADDING ||
          wy < -height / 2 + PADDING ||
          wy > height / 2 - PADDING
        ) {
          return null;
        }
        // パディングを除いたグリッド座標に変換
        const gridX = wx + width / 2 - PADDING;
        const gridY = height / 2 - PADDING - wy;
        const col = Math.floor(gridX / (gridW / cols));
        const row = Math.floor(gridY / CELL_SIZE);
        const idx = row * cols + col;
        // セル内か判定
        if (
          0 <= col &&
          col < cols &&
          0 <= row &&
          row < rows &&
          idx < items.length
        ) {
          // セルの中心座標
          const cellCenterX = PADDING + (col + 0.5) * (gridW / cols);
          const cellCenterY = PADDING + (row + 0.5) * CELL_SIZE;
          // ポインタがセルの正方形領域内か
          if (
            Math.abs(wx + width / 2 - cellCenterX) <= cellSize / 2 &&
            Math.abs(height / 2 - wy - cellCenterY) <= cellSize / 2
          ) {
            return idx;
          }
        }
        return null;
      };

      const newHandlePointerMove = (e: MouseEvent) => {
        const idx = getCellIndexFromPointer(e);
        if (hoverIdxRef.current !== idx) {
          hoverIdxRef.current = idx;
          forceUpdate((v) => !v);
        }
      };

      const newHandlePointerLeave = () => {
        if (hoverIdxRef.current !== null) {
          hoverIdxRef.current = null;
          forceUpdate((v) => !v);
        }
      };

      const newHandleClick = (e: MouseEvent) => {
        const idx = getCellIndexFromPointer(e);
        if (idx !== null && 0 <= idx && idx < items.length) {
          const item = items[idx];
          const params = new URLSearchParams();
          params.set("function", encodeURIComponent(item.functionLatex));
          params.set(
            "initialValue",
            encodeURIComponent(item.initialValueLatex)
          );
          params.set("iter", item.iterations.toString());
          params.set("origin", `${item.center[0]},${item.center[1]}`);
          params.set("radius", item.radius.toString());
          router.push(`/apps/compdynam?${params.toString()}`);
        }
      };

      // 新しいイベントリスナーを追加
      renderer.domElement.addEventListener("mousemove", newHandlePointerMove);
      renderer.domElement.addEventListener("mouseleave", newHandlePointerLeave);
      renderer.domElement.addEventListener("click", newHandleClick);

      // イベントハンドラーを更新
      eventHandlersRef.current = {
        handlePointerMove: newHandlePointerMove,
        handlePointerLeave: newHandlePointerLeave,
        handleClick: newHandleClick,
      };
    }
  }, [canvasSize, cols, rows, items.length, router]);

  // メッシュ生成（items変更時のみ）
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    canvasRef.current.innerHTML = "";

    // 動的にサイズとグリッド数を計算
    const parentRect = containerRef.current.getBoundingClientRect();
    const width = parentRect.width;
    const cols = Math.max(1, Math.floor(width / CELL_SIZE));
    const rows = Math.ceil(items.length / cols);
    const height = rows * CELL_SIZE + PADDING * 2;

    if (width === 0 || height === 0) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      10
    );
    camera.position.z = 1;
    cameraRef.current = camera;

    // グリッド配置
    const gridW = width - PADDING * 2;
    const gridH = height - PADDING * 2;
    const cellW = gridW / cols;
    const cellH = CELL_SIZE;
    const cellSize = Math.min(cellW, cellH) * 0.9;

    // メッシュ生成
    const meshes: THREE.Mesh[] = [];
    items.forEach((item, idx) => {
      let fragmentShader = baseFragmentShader;
      let vertexShader = baseVertexShader;
      try {
        const functionCode = latexToComplexGLSL(item.functionLatex, undefined, [
          "z",
          "c",
          "t",
        ]);
        const initialValueCode = latexToComplexGLSL(
          item.initialValueLatex,
          undefined,
          ["c", "t"]
        );
        fragmentShader = fragmentShader.replace(
          /z\/\* input func here \*\//,
          functionCode
        );
        fragmentShader = fragmentShader.replace(
          /c\/\* input initial value here \*\//,
          initialValueCode
        );
      } catch (e) {}
      // メッシュ
      const geometry = new THREE.PlaneGeometry(cellSize, cellSize);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(cellSize / 2, cellSize / 2) },
          uGraph: {
            value: {
              origin: new THREE.Vector2(...item.center),
              radius: item.radius,
            },
          },
          uIterations: { value: item.iterations },
          uRenderMode: { value: 0 },
        },
        vertexShader,
        fragmentShader,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      mesh.position.x = -width / 2 + PADDING + cellW * (col + 0.5);
      mesh.position.y = height / 2 - PADDING - cellH * (row + 0.5);
      mesh.userData = { item, row, col, idx };
      scene.add(mesh);
      meshes.push(mesh);
    });
    meshesRef.current = meshes;

    // --- requestAnimationFrameで毎フレーム描画 ---
    let running = true;
    let lastTime = performance.now();
    function renderAll(deltaTime: number) {
      meshes.forEach((mesh, idx) => {
        (mesh.material as THREE.ShaderMaterial).uniforms.uTime.value +=
          deltaTime / 1000;
        mesh.scale.set(
          hoverIdxRef.current === idx ? 1.1 : 1,
          hoverIdxRef.current === idx ? 1.1 : 1,
          1
        );
      });
      renderer.render(scene, camera);
    }
    function animate() {
      if (!running) return;
      const now = performance.now();
      const deltaTime = now - lastTime;
      lastTime = now;
      renderAll(deltaTime);
      animationIdRef.current = requestAnimationFrame(animate);
    }
    animate();

    // ホバー・クリック判定
    const getCellIndexFromPointer = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const wx = (x * width) / 2;
      const wy = (y * height) / 2;
      // パディング内か判定
      if (
        wx < -width / 2 + PADDING ||
        wx > width / 2 - PADDING ||
        wy < -height / 2 + PADDING ||
        wy > height / 2 - PADDING
      ) {
        return null;
      }
      // パディングを除いたグリッド座標に変換
      const gridX = wx + width / 2 - PADDING;
      const gridY = height / 2 - PADDING - wy;
      const col = Math.floor(gridX / (gridW / cols));
      const row = Math.floor(gridY / CELL_SIZE);
      const idx = row * cols + col;
      // セル内か判定
      if (
        0 <= col &&
        col < cols &&
        0 <= row &&
        row < rows &&
        idx < items.length
      ) {
        // セルの中心座標
        const cellCenterX = PADDING + (col + 0.5) * (gridW / cols);
        const cellCenterY = PADDING + (row + 0.5) * CELL_SIZE;
        // ポインタがセルの正方形領域内か
        if (
          Math.abs(wx + width / 2 - cellCenterX) <= cellSize / 2 &&
          Math.abs(height / 2 - wy - cellCenterY) <= cellSize / 2
        ) {
          return idx;
        }
      }
      return null;
    };

    const handlePointerMove = (e: MouseEvent) => {
      const idx = getCellIndexFromPointer(e);
      if (hoverIdxRef.current !== idx) {
        hoverIdxRef.current = idx;
        forceUpdate((v) => !v);
      }
    };
    const handlePointerLeave = () => {
      if (hoverIdxRef.current !== null) {
        hoverIdxRef.current = null;
        forceUpdate((v) => !v);
      }
    };
    const handleClick = (e: MouseEvent) => {
      const idx = getCellIndexFromPointer(e);
      if (idx !== null && 0 <= idx && idx < items.length) {
        const item = items[idx];
        const params = new URLSearchParams();
        params.set("function", encodeURIComponent(item.functionLatex));
        params.set("initialValue", encodeURIComponent(item.initialValueLatex));
        params.set("iter", item.iterations.toString());
        params.set("origin", `${item.center[0]},${item.center[1]}`);
        params.set("radius", item.radius.toString());
        router.push(`/apps/compdynam?${params.toString()}`);
      }
    };

    // イベントハンドラーをrefに保存
    eventHandlersRef.current = {
      handlePointerMove,
      handlePointerLeave,
      handleClick,
    };

    renderer.domElement.addEventListener("mousemove", handlePointerMove);
    renderer.domElement.addEventListener("mouseleave", handlePointerLeave);
    renderer.domElement.addEventListener("click", handleClick);

    return () => {
      running = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (eventHandlersRef.current) {
        const { handlePointerMove, handlePointerLeave, handleClick } =
          eventHandlersRef.current;
        renderer.domElement.removeEventListener("mousemove", handlePointerMove);
        renderer.domElement.removeEventListener(
          "mouseleave",
          handlePointerLeave
        );
        renderer.domElement.removeEventListener("click", handleClick);
      }
      renderer.dispose();
      meshes.forEach((mesh) => {
        (mesh.material as THREE.Material).dispose();
        mesh.geometry.dispose();
        scene.remove(mesh);
      });
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      meshesRef.current = [];
      eventHandlersRef.current = null;
    };
  }, [items, router]);

  // 親divでoverflow-y: auto、canvasは横幅100%、高さ可変
  return (
    <div
      ref={containerRef}
      className={styles.gridContainer}
      tabIndex={0}
      aria-label="CompDynamギャラリーグリッド"
    >
      <div
        ref={canvasRef}
        className={
          hoverIdxRef.current !== null
            ? `${styles.gridCanvas} ${styles["gridCanvas--hover"]}`
            : styles.gridCanvas
        }
      />
    </div>
  );
}
