import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { fragmentShader as baseFragmentShader } from "@/app/apps/(maths)/compdynam/Shaders/FragmentShader";
import { vertexShader as baseVertexShader } from "@/app/apps/(maths)/compdynam/Shaders/VertexShader";
import { latexToGLSL } from "@/src/Parser/latexToGLSL";
import GraphMgr from "@/src/GraphMgr";
import styles from "./Main.module.scss";

interface CompDynamGalleryItem {
  id: string;
  title: string;
  functionLatex: string;
  initialValueLatex: string;
  iterations: number;
  center: [number, number];
  radius: number;
}

interface GalleryGridCanvasProps {
  items: CompDynamGalleryItem[];
  onSelect: (item: CompDynamGalleryItem) => void;
  className?: string;
}

const CELL_SIZE = 300; // px 固定
const PADDING = 20; // px, キャンバス内余白

export default function GalleryGridCanvas({
  items,
  onSelect,
  className,
}: GalleryGridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [cols, setCols] = useState(1);
  const [rows, setRows] = useState(1);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

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

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.innerHTML = "";
    const { width, height } = canvasSize;
    if (width === 0 || height === 0) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    canvasRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      10
    );
    camera.position.z = 1;

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
        const functionCode = latexToGLSL(item.functionLatex, undefined, [
          "z",
          "c",
          "t",
        ]);
        const initialValueCode = latexToGLSL(
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

    function renderAll() {
      meshes.forEach((mesh, idx) => {
        mesh.scale.set(
          hoverIdx === idx ? 1.1 : 1,
          hoverIdx === idx ? 1.1 : 1,
          1
        );
      });
      renderer.render(scene, camera);
    }
    renderAll();

    // ホバー・クリック判定
    const handlePointerMove = (e: MouseEvent) => {
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
        setHoverIdx(null);
        renderAll();
        return;
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
          setHoverIdx(idx);
          renderAll();
          return;
        }
      }
      setHoverIdx(null);
      renderAll();
    };
    const handlePointerLeave = () => {
      setHoverIdx(null);
      renderAll();
    };
    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const wx = (x * width) / 2;
      const wy = (y * height) / 2;
      const col = Math.floor((wx + width / 2) / cellW);
      const row = Math.floor((-wy + height / 2) / cellH);
      const idx = row * cols + col;
      if (0 <= idx && idx < items.length) {
        onSelect(items[idx]);
      }
    };
    renderer.domElement.addEventListener("mousemove", handlePointerMove);
    renderer.domElement.addEventListener("mouseleave", handlePointerLeave);
    renderer.domElement.addEventListener("click", handleClick);

    return () => {
      renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      renderer.domElement.removeEventListener("mouseleave", handlePointerLeave);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.dispose();
      meshes.forEach((mesh) => {
        (mesh.material as THREE.Material).dispose();
        mesh.geometry.dispose();
        scene.remove(mesh);
      });
    };
  }, [items, onSelect, canvasSize, hoverIdx, cols, rows]);

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
          hoverIdx !== null
            ? `${styles.gridCanvas} ${styles["gridCanvas--hover"]}`
            : styles.gridCanvas
        }
        style={{ height: canvasSize.height }}
      />
    </div>
  );
}
