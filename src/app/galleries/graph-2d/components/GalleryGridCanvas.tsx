"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { fragmentShader as baseFragmentShader } from "@/app/apps/(maths)/graph-2d/Shaders/FragmentShader";
import { vertexShader as baseVertexShader } from "@/app/apps/(maths)/graph-2d/Shaders/VertexShader";
import type {
  Graph2DGalleryItem,
  Graph2DGalleryItemWithTags,
} from "@/app/galleries/graph-2d/GalleryData";
import { useTheme } from "@/shared/hooks/useTheme";
import {
  type ChainedInequalityResult,
  type ConstantDef,
  type FunctionDef,
  isNumericExpression,
  parseChainedInequality,
  parseConstantDef,
  parseFunctionDef,
} from "@/shared/parser/graph2d/expressionParser";
import { latexToGLSL } from "@/shared/parser/latexToGLSL";

interface GalleryGridCanvasProps {
  items: (Graph2DGalleryItem | Graph2DGalleryItemWithTags)[];
  className?: string;
  onItemClick?: (item: Graph2DGalleryItemWithTags) => void;
}

const CELL_SIZE = 100; // px 固定
const PADDING = 40; // px, キャンバス内余白

// 組み込み関数リスト
const BUILTIN_FUNCS = [
  "sin",
  "cos",
  "tan",
  "cot",
  "sec",
  "csc",
  "arcsin",
  "arccos",
  "arctan",
  "arccot",
  "arcsec",
  "arccsc",
  "exp",
  "sinh",
  "cosh",
  "tanh",
  "coth",
  "sech",
  "csch",
  "arsinh",
  "arcosh",
  "artanh",
  "arcoth",
  "arsech",
  "arcsch",
  "abs",
  "ln",
  "max",
  "min",
  "floor",
  "ceil",
  "round",
  "fract",
];

/**
 * 連鎖不等式をGLSLに変換
 */
function chainedInequalityToGLSL(
  result: ChainedInequalityResult,
  knownFuncs: string[],
  knownVars: string[],
): string {
  const { parts, operators } = result;
  const partsGLSL = parts.map((part) =>
    latexToGLSL(part, knownFuncs, knownVars),
  );

  const diffs: string[] = [];
  for (let i = 0; i < operators.length; i++) {
    const left = partsGLSL[i];
    const right = partsGLSL[i + 1];
    if (operators[i] === "<") {
      diffs.push(`(${left}) - (${right})`);
    } else {
      diffs.push(`(${right}) - (${left})`);
    }
  }

  if (diffs.length === 1) {
    return diffs[0];
  }
  return diffs.reduceRight((acc, diff) => `max(${diff}, ${acc})`);
}

/**
 * 関数定義からGLSL関数を生成
 */
function generateGLSLFunction(def: FunctionDef, knownFuncs: string[]): string {
  try {
    const bodyGLSL = latexToGLSL(
      def.body,
      [...BUILTIN_FUNCS, ...knownFuncs],
      [...def.args, "t"],
    );
    const params = def.args.map((a) => `float ${a}`).join(", ");
    return `float ${def.name}(${params}) { return ${bodyGLSL}; }`;
  } catch (e) {
    console.error(`Failed to generate GLSL function for ${def.name}:`, e);
    return `float ${def.name}(${def.args.map((a) => `float ${a}`).join(", ")}) { return 0.0; }`;
  }
}

/**
 * 式リストからシェーダーを生成
 */
export function generateShaderFromExpressions(
  expressions: string[],
  baseShader: string,
): { shader: string; exprType: number } {
  const functionDefs: FunctionDef[] = [];
  const constantDefs: ConstantDef[] = [];
  let mainExpression: string | null = null;

  // 式を解析
  for (const expr of expressions) {
    const funcDef = parseFunctionDef(expr);
    if (funcDef) {
      functionDefs.push(funcDef);
      continue;
    }

    const constDef = parseConstantDef(expr);
    if (constDef) {
      constantDefs.push(constDef);
      continue;
    }

    mainExpression = expr;
  }

  // ユーザー定義関数名と定数名を収集（重複チェック）
  const userFuncNames = functionDefs.map((def) => def.name);
  const userConstNames = constantDefs.map((def) => def.name);
  const allUserNames = [...userFuncNames, ...userConstNames];
  const duplicateNames = allUserNames.filter(
    (name, index) => allUserNames.indexOf(name) !== index,
  );
  if (duplicateNames.length > 0) {
    console.error(`Duplicate definition: ${duplicateNames[0]}`);
    return { shader: baseShader, exprType: 0 };
  }

  // GLSL関数を生成
  const glslFunctions = functionDefs.map((def, idx) => {
    const knownFuncs = functionDefs.slice(0, idx).map((d) => d.name);
    return generateGLSLFunction(def, knownFuncs);
  });

  const knownFuncs = [...BUILTIN_FUNCS, ...userFuncNames];
  const knownVars = ["x", "y", "t", ...userConstNames];

  // GLSL定数を生成
  const glslConstants = constantDefs.map((def, idx) => {
    const prevConstNames = constantDefs.slice(0, idx).map((d) => d.name);
    const constKnownVars = ["x", "y", "t", ...prevConstNames];
    const valueGLSL = latexToGLSL(def.value, knownFuncs, constKnownVars);
    return `float ${def.name} = ${valueGLSL};`;
  });

  let mainGLSL = "0.0";
  let exprType = 0; // 0: 不等式, 1: 数値式

  if (mainExpression) {
    try {
      if (isNumericExpression(mainExpression)) {
        // 数値式
        mainGLSL = latexToGLSL(mainExpression, knownFuncs, knownVars);
        exprType = 1;
      } else {
        // 連鎖不等式
        const chainedInequality = parseChainedInequality(mainExpression);
        if (chainedInequality) {
          mainGLSL = chainedInequalityToGLSL(
            chainedInequality,
            knownFuncs,
            knownVars,
          );
        }
      }
    } catch (e) {
      console.error("Failed to convert expression to GLSL:", e);
    }
  }

  // シェーダーを構築
  let shader = baseShader;

  // ユーザー定義関数を挿入（graph2d関数の前に）
  const funcInsertPoint = "float graph2d(vec2 _C) {";
  const funcCode = `${glslFunctions.join("\n\n")}\n\n`;
  shader = shader.replace(funcInsertPoint, funcCode + funcInsertPoint);

  // 定数とメイン式を挿入
  const constantsCode =
    glslConstants.length > 0 ? `${glslConstants.join("\n  ")}\n\n  ` : "";
  shader = shader.replace(
    /\/\* input func here \*\//,
    `${constantsCode}c = ${mainGLSL};`,
  );

  return { shader, exprType };
}

export default function GalleryGridCanvas({
  items,
  className,
  onItemClick,
}: GalleryGridCanvasProps) {
  const { themeValue } = useTheme();
  const themeValueRef = useRef(themeValue);

  // themeValue を ref に同期
  useEffect(() => {
    themeValueRef.current = themeValue;
  }, [themeValue]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [cols, setCols] = useState(1);
  const [rows, setRows] = useState(1);
  const [, forceUpdate] = useState(false);
  const hoverIdxRef = useRef<number | null>(null);

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
          // 詳細モーダルを開く
          if (onItemClick && "id" in item) {
            onItemClick(item as Graph2DGalleryItemWithTags);
          }
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
  }, [canvasSize, cols, rows, items.length, onItemClick, items]);

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
      10,
    );
    camera.position.z = 1;
    cameraRef.current = camera;

    // グリッド配置
    const gridW = width - PADDING * 2;
    const cellW = gridW / cols;
    const cellH = CELL_SIZE;
    const cellSize = Math.min(cellW, cellH) * 0.9;

    // メッシュ生成
    const meshes: THREE.Mesh[] = [];
    items.forEach((item, idx) => {
      let fragmentShader = baseFragmentShader;
      let exprType = 0;
      const vertexShader = baseVertexShader;
      try {
        const result = generateShaderFromExpressions(
          item.expressions,
          baseFragmentShader,
        );
        fragmentShader = result.shader;
        exprType = result.exprType;
      } catch (e) {
        console.error("Failed to generate shader for item", idx, e);
      }

      // メッシュ
      const geometry = new THREE.PlaneGeometry(cellSize, cellSize);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uTheme: { value: themeValueRef.current },
          uResolution: { value: new THREE.Vector2(cellSize / 2, cellSize / 2) },
          uGraph: {
            value: {
              origin: new THREE.Vector2(...item.center),
              radius: item.radius,
            },
          },
          uIterations: { value: 50 },
          uRenderMode: { value: exprType === 1 ? 2 : 0 }, // 数値式の場合は tanh モード
          uExprType: { value: exprType },
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
        const uniforms = (mesh.material as THREE.ShaderMaterial).uniforms;
        uniforms.uTime.value += deltaTime / 1000;
        uniforms.uTheme.value = themeValueRef.current;
        mesh.scale.set(
          hoverIdxRef.current === idx ? 1.1 : 1,
          hoverIdxRef.current === idx ? 1.1 : 1,
          1,
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
    const gridW2 = width - PADDING * 2;
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
      const col = Math.floor(gridX / (gridW2 / cols));
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
        const cellCenterX = PADDING + (col + 0.5) * (gridW2 / cols);
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
        // 詳細モーダルを開く
        if (onItemClick && "id" in item) {
          onItemClick(item as Graph2DGalleryItemWithTags);
        }
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
          handlePointerLeave,
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
  }, [items, onItemClick]);

  // 親divでoverflow-y: auto、canvasは横幅100%、高さ可変
  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-y-auto focus:outline-none ${className ?? ""}`}
      tabIndex={0}
      aria-label="Graph 2D ギャラリーグリッド"
    >
      <div
        ref={canvasRef}
        className={`w-full ${hoverIdxRef.current !== null ? "cursor-pointer" : ""}`}
      />
    </div>
  );
}
