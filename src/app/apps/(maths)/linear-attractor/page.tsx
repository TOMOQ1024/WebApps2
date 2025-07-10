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
import ControlButtons from "./components/ControlButtons";

const TEX_SIZE = 128;

// パラメータ
const DEFAULT_PARAMS = {
  pointSize: 0.1,
  xMin: -2,
  xMax: 2,
  yMin: -2,
  yMax: 2,
  numPoints: TEX_SIZE * TEX_SIZE,
  threshold0: 1 / 4,
  threshold1: 2 / 4,
  threshold2: 3 / 4,
  threshold3: 1,
  transform0: new THREE.Matrix4(
    0.5,
    0.0,
    0.0,
    0.0,
    0.0,
    0.5,
    0.0,
    0.0,
    0.0,
    0.0,
    0.5,
    0.0,
    +0.5,
    +0.5,
    +0.5,
    1.0
  ),
  transform1: new THREE.Matrix4(
    0.5,
    0.0,
    0.0,
    0.0,
    0.0,
    0.5,
    0.0,
    0.0,
    0.0,
    0.0,
    0.5,
    0.0,
    -0.5,
    -0.5,
    +0.5,
    1.0
  ),
  transform2: new THREE.Matrix4(
    0.5,
    0.0,
    0.0,
    0.0,
    0.0,
    0.5,
    0.0,
    0.0,
    0.0,
    0.0,
    0.5,
    0.0,
    -0.5,
    +0.5,
    -0.5,
    1.0
  ),
  transform3: new THREE.Matrix4(
    0.5,
    0.0,
    0.0,
    0.0,
    0.0,
    0.5,
    0.0,
    0.0,
    0.0,
    0.0,
    0.5,
    0.0,
    +0.5,
    -0.5,
    -0.5,
    1.0
  ),
};

function createOriginTexture(gpuCompute: GPUComputationRenderer) {
  const texture = gpuCompute.createTexture();
  const data = (texture.image as any).data as Float32Array;

  for (let i = 0; i < TEX_SIZE * TEX_SIZE; i++) {
    data[i * 4 + 0] = 0;
    data[i * 4 + 1] = 0;
    data[i * 4 + 2] = 0;
    data[i * 4 + 3] = 1;
  }

  return texture;
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
  const orbitControlsRef = useRef<OrbitControls>(null);

  const initializeUniforms = (positionVariable: any) => {
    positionVariable.material.uniforms.uTime = { value: 0 };
    positionVariable.material.uniforms.uThreshold0 = {
      value: params.threshold0,
    };
    positionVariable.material.uniforms.uThreshold1 = {
      value: params.threshold1,
    };
    positionVariable.material.uniforms.uThreshold2 = {
      value: params.threshold2,
    };
    positionVariable.material.uniforms.uThreshold3 = {
      value: params.threshold3,
    };
    positionVariable.material.uniforms.uTransform0 = {
      value: params.transform0.transpose(),
    };
    positionVariable.material.uniforms.uTransform1 = {
      value: params.transform1.transpose(),
    };
    positionVariable.material.uniforms.uTransform2 = {
      value: params.transform2.transpose(),
    };
    positionVariable.material.uniforms.uTransform3 = {
      value: params.transform3.transpose(),
    };
  };

  // 点群を原点に初期化する関数
  const initializeToOrigin = () => {
    if (!gpuComputeRef.current || !rendererRef.current) return;

    // 現在のGPUComputationRendererを削除し、新しく作成
    const renderer = rendererRef.current;
    const gpuCompute = new GPUComputationRenderer(TEX_SIZE, TEX_SIZE, renderer);
    gpuComputeRef.current = gpuCompute;

    // 原点テクスチャを作成
    const originTexture = createOriginTexture(gpuCompute);

    // 新しいpositionVariableを作成
    const positionVariable = gpuCompute.addVariable(
      "texturePosition",
      computeFragmentShader,
      originTexture
    );
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable]);

    // ユニフォームを設定
    initializeUniforms(positionVariable);

    // GPGPU初期化
    const err = gpuCompute.init();
    if (err) {
      alert("GPGPU初期化エラー: " + err);
      return;
    }

    // 変数の参照を更新
    positionVariableRef.current = positionVariable;
  };
  // 初期化
  useEffect(() => {
    if (!canvasRef.current) return;
    // レンダラー
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
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
    camera.position.set(0, 0, 25);
    cameraRef.current = camera;

    // orbit controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
    orbitControls.enableZoom = true;
    orbitControls.enablePan = true;
    orbitControls.enableRotate = true;
    orbitControlsRef.current = orbitControls;
    // GPGPUセットアップ
    const gpuCompute = new GPUComputationRenderer(TEX_SIZE, TEX_SIZE, renderer);
    gpuComputeRef.current = gpuCompute;
    // 初期位置テクスチャ
    const posTex = createOriginTexture(gpuCompute);
    // 変数登録
    const positionVariable = gpuCompute.addVariable(
      "texturePosition",
      computeFragmentShader,
      posTex
    );
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable]);
    // ユニフォーム
    initializeUniforms(positionVariable);
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
      // 現在のGPUComputationRendererとpositionVariableを使用
      if (gpuComputeRef.current && positionVariableRef.current) {
        // GPGPU計算
        positionVariableRef.current.material.uniforms.uTime.value =
          performance.now() / 1000;
        gpuComputeRef.current.compute();
        // 最新の位置テクスチャを渡す
        material.uniforms.positionTexture.value =
          gpuComputeRef.current.getCurrentRenderTarget(
            positionVariableRef.current
          ).texture;
      }
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
    positionVariableRef.current.material.uniforms.uTime.value = 0;
    // 点サイズも更新
    if (pointsRef.current) {
      (
        pointsRef.current.material as THREE.ShaderMaterial
      ).uniforms.pointSize.value = params.pointSize;
    }
  }, [params.pointSize]);

  return (
    <main className={styles.main}>
      <ControlButtons
        onResetControl={() => {
          if (orbitControlsRef.current) {
            orbitControlsRef.current.reset();
          }
        }}
        onReset={() => {
          setParams(DEFAULT_PARAMS);
        }}
        onInitializeToOrigin={initializeToOrigin}
      />
      <div className={styles.controls}>
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
