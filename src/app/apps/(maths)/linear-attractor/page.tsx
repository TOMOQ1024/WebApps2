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
import { RealNumberInput } from "./components/Slider/RealNumberInput";
import { MatrixInput } from "./components/Slider/MatrixInput";
import { sampleParams } from "./SampleParams";

const TEX_SIZE = 256;

// パラメータ
const DEFAULT_PARAMS = {
  pointSize: 0.03,
  xMin: -2,
  xMax: 2,
  yMin: -2,
  yMax: 2,
  numPoints: TEX_SIZE * TEX_SIZE,
  ...sampleParams.sierpinski_tetrahedron,
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
  const paramsRef = useRef(params);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const gpuComputeRef = useRef<GPUComputationRenderer>(null);
  const positionVariableRef = useRef<any>(null);
  const orbitControlsRef = useRef<OrbitControls>(null);
  const [error, setError] = useState<string>("");
  const [controlsVisible, setControlsVisible] = useState(true); // 追加

  // paramsの最新値をrefに反映
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const initializeUniforms = (positionVariable: any) => {
    positionVariable.material.uniforms.uTime = { value: 0 };
    positionVariable.material.uniforms.uThreshold0 = {
      value: paramsRef.current.threshold0,
    };
    positionVariable.material.uniforms.uThreshold1 = {
      value: paramsRef.current.threshold1,
    };
    positionVariable.material.uniforms.uThreshold2 = {
      value: paramsRef.current.threshold2,
    };
    positionVariable.material.uniforms.uThreshold3 = {
      value: paramsRef.current.threshold3,
    };
    positionVariable.material.uniforms.uTransform0 = {
      value: paramsRef.current.transform0,
    };
    positionVariable.material.uniforms.uTransform1 = {
      value: paramsRef.current.transform1,
    };
    positionVariable.material.uniforms.uTransform2 = {
      value: paramsRef.current.transform2,
    };
    positionVariable.material.uniforms.uTransform3 = {
      value: paramsRef.current.transform3,
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
    camera.position.set(0, 0, 4);
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
        pointSize: { value: paramsRef.current.pointSize },
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
        positionVariableRef.current.material.uniforms.uThreshold0.value =
          paramsRef.current.threshold0;
        positionVariableRef.current.material.uniforms.uThreshold1.value =
          paramsRef.current.threshold1;
        positionVariableRef.current.material.uniforms.uThreshold2.value =
          paramsRef.current.threshold2;
        positionVariableRef.current.material.uniforms.uThreshold3.value =
          paramsRef.current.threshold3;
        positionVariableRef.current.material.uniforms.uTransform0.value =
          paramsRef.current.transform0;
        positionVariableRef.current.material.uniforms.uTransform1.value =
          paramsRef.current.transform1;
        positionVariableRef.current.material.uniforms.uTransform2.value =
          paramsRef.current.transform2;
        positionVariableRef.current.material.uniforms.uTransform3.value =
          paramsRef.current.transform3;
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

  // threshold変更時のuniform更新
  useEffect(() => {
    if (!positionVariableRef.current) return;
    positionVariableRef.current.material.uniforms.uThreshold0.value =
      params.threshold0;
    positionVariableRef.current.material.uniforms.uThreshold1.value =
      params.threshold1;
    positionVariableRef.current.material.uniforms.uThreshold2.value =
      params.threshold2;
    positionVariableRef.current.material.uniforms.uThreshold3.value =
      params.threshold3;
  }, [
    params.threshold0,
    params.threshold1,
    params.threshold2,
    params.threshold3,
  ]);

  return (
    <main className={styles.main}>
      <ControlButtons
        onResetControl={() => {
          if (orbitControlsRef.current) {
            orbitControlsRef.current.reset();
          }
        }}
        onReset={() => {
          setParams({ ...DEFAULT_PARAMS });
        }}
        onInitializeToOrigin={initializeToOrigin}
        onToggleControlsVisible={() => setControlsVisible((v) => !v)} // 追加
        onRandomSample={() => {
          const keys = Object.keys(
            sampleParams
          ) as (keyof typeof sampleParams)[];
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          setParams((prev) => ({
            ...prev,
            ...sampleParams[randomKey],
          }));
        }}
      />
      {controlsVisible && (
        <div className={styles.controlsWrapper}>
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.error}>{error}</div>
            </div>
          )}
          <div className={styles.controls}>
            <Slider
              label="頂点サイズ"
              min={0.005}
              max={0.2}
              step={0.001}
              value={params.pointSize}
              onChange={(v: number) =>
                setParams((prev) => ({
                  ...prev,
                  pointSize: v,
                }))
              }
            />
          </div>
          <div
            className={styles.controls}
            style={{ display: "flex", flexDirection: "row", gap: 16 }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 220,
                }}
              >
                <RealNumberInput
                  label={`重み${i}`}
                  value={
                    params[`threshold${i}` as keyof typeof params] as number
                  }
                  onChange={(v: number) =>
                    setParams((prev) => ({
                      ...prev,
                      [`threshold${i}`]: v,
                    }))
                  }
                  onError={(err: string) => {
                    setError(err);
                  }}
                />
                <MatrixInput
                  label={`変換行列${i}`}
                  value={
                    params[
                      `transform${i}` as keyof typeof params
                    ] as THREE.Matrix4
                  }
                  onChange={(m: THREE.Matrix4) =>
                    setParams((prev) => ({
                      ...prev,
                      [`transform${i}`]: m,
                    }))
                  }
                  onError={(err: string) => {
                    setError(err);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <canvas className={styles.canvas} ref={canvasRef} />
    </main>
  );
}
