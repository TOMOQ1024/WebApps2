"use client";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { computeFragmentShader } from "./shaders/computeFragmentShader";
import { fragmentShader } from "./shaders/fragmentShader";
import { vertexShader } from "./shaders/vertexShader";
import styles from "./page.module.scss";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Slider } from "./components/Slider";

const TEX_SIZE = 128;

// Gmowski-Mira写像のパラメータ
const DEFAULT_PARAMS = {
  alpha: 0.009,
  sigma: 0.05,
  mu: -0.801,
  pointSize: 0.05,
  xMin: -2,
  xMax: 2,
  yMin: -2,
  yMax: 2,
  numPoints: TEX_SIZE * TEX_SIZE,
};

function generateInitialTexture(
  texture: THREE.DataTexture,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
) {
  const data = (texture.image as any).data as Float32Array;
  for (let i = 0; i < TEX_SIZE * TEX_SIZE; i++) {
    const x = Math.random() * (xMax - xMin) + xMin;
    const y = Math.random() * (yMax - yMin) + yMin;
    data[i * 4 + 0] = x;
    data[i * 4 + 1] = y;
    data[i * 4 + 2] = 0;
    data[i * 4 + 3] = 1;
  }
}

export default function GmowskiMiraAttractorPage() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const gpuComputeRef = useRef<GPUComputationRenderer>(null);
  const positionVariableRef = useRef<any>(null);

  // 初期化
  useEffect(() => {
    if (!canvasRef.current) return;
    // レンダラー
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setClearColor(0x111111);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    rendererRef.current = renderer;

    // シーン
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // カメラ
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // orbit controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
    orbitControls.enableZoom = true;
    orbitControls.enablePan = true;
    orbitControls.enableRotate = true;

    // GPGPUセットアップ
    const gpuCompute = new GPUComputationRenderer(TEX_SIZE, TEX_SIZE, renderer);
    gpuComputeRef.current = gpuCompute;
    // 初期位置テクスチャ
    const posTex = gpuCompute.createTexture();
    generateInitialTexture(
      posTex,
      params.xMin,
      params.xMax,
      params.yMin,
      params.yMax
    );
    // 変数登録
    const positionVariable = gpuCompute.addVariable(
      "texturePosition",
      computeFragmentShader,
      posTex
    );
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable]);
    // ユニフォーム
    positionVariable.material.uniforms.alpha = { value: params.alpha };
    positionVariable.material.uniforms.sigma = { value: params.sigma };
    positionVariable.material.uniforms.mu = { value: params.mu };
    // 初期化
    const err = gpuCompute.init();
    if (err) {
      alert("GPGPU初期化エラー: " + err);
      return;
    }
    positionVariableRef.current = positionVariable;

    // 点群ジオメトリ
    const geometry = new THREE.BufferGeometry();
    // 各点のuv座標を格納（TEX_SIZE*TEX_SIZE点）
    const positions = new Float32Array(TEX_SIZE * TEX_SIZE * 3);
    const uvs = new Float32Array(TEX_SIZE * TEX_SIZE * 2);
    let k = 0;
    for (let y = 0; y < TEX_SIZE; y++) {
      for (let x = 0; x < TEX_SIZE; x++) {
        positions[k * 3 + 0] = 0;
        positions[k * 3 + 1] = 0;
        positions[k * 3 + 2] = 0;
        uvs[k * 2 + 0] = x / (TEX_SIZE - 1);
        uvs[k * 2 + 1] = y / (TEX_SIZE - 1);
        k++;
      }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    // シェーダーマテリアル
    const material = new THREE.ShaderMaterial({
      uniforms: {
        positionTexture: { value: null },
        pointSize: { value: params.pointSize },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);

    // アニメーションループ
    let animId: number;
    const animate = () => {
      // GPGPU計算
      gpuCompute.compute();
      // 最新の位置テクスチャを渡す
      material.uniforms.positionTexture.value =
        gpuCompute.getCurrentRenderTarget(positionVariable).texture;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    // リサイズ対応
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      rendererRef.current.setSize(w, h, false);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      scene.remove(points);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // パラメータ変更時のuniform更新
  useEffect(() => {
    if (!positionVariableRef.current) return;
    positionVariableRef.current.material.uniforms.alpha.value = params.alpha;
    positionVariableRef.current.material.uniforms.sigma.value = params.sigma;
    positionVariableRef.current.material.uniforms.mu.value = params.mu;
    // 点サイズも更新
    if (pointsRef.current) {
      (
        pointsRef.current.material as THREE.ShaderMaterial
      ).uniforms.pointSize.value = params.pointSize;
    }
  }, [params.alpha, params.sigma, params.mu, params.pointSize]);

  return (
    <main className={styles.main}>
      <div className={styles.controls}>
        <Slider
          label="α (alpha)"
          min={-1}
          max={1}
          step={0.01}
          value={params.alpha}
          onChange={(v: number) => setParams((p) => ({ ...p, alpha: v }))}
        />
        <Slider
          label="σ (sigma)"
          min={-1}
          max={1}
          step={0.001}
          value={params.sigma}
          onChange={(v: number) => setParams((p) => ({ ...p, sigma: v }))}
        />
        <Slider
          label="μ (mu)"
          min={-1}
          max={1}
          step={0.001}
          value={params.mu}
          onChange={(v: number) => setParams((p) => ({ ...p, mu: v }))}
        />
        <Slider
          label="点サイズ (pointSize)"
          min={0.005}
          max={0.2}
          step={0.001}
          value={params.pointSize}
          onChange={(v: number) => setParams((p) => ({ ...p, pointSize: v }))}
        />
      </div>
      <canvas className={styles.canvas} ref={canvasRef} />
    </main>
  );
}
