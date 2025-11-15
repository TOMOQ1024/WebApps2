"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import ControlButtons from "./components/ControlButtons";
import { MatrixInput2D } from "./components/MatrixInput2D";
import { RealNumberInput } from "./components/RealNumberInput";
import { Slider } from "./components/Slider";
import { sampleParams } from "./SampleParams";
import { computeFragmentShader } from "./shaders/computeFragmentShader";
import { fragmentShader } from "./shaders/fragmentShader";
import { vertexShader } from "./shaders/vertexShader";

const TEX_SIZE = 256;

// パラメータ
const DEFAULT_PARAMS = {
  pointSize: 0.02,
  numPoints: TEX_SIZE * TEX_SIZE,
  ...sampleParams.sierpinski_triangle,
};

function createOriginTexture(gpuCompute: GPUComputationRenderer) {
  const texture = gpuCompute.createTexture();
  const data = (texture.image as unknown as { data: Float32Array }).data;

  for (let i = 0; i < TEX_SIZE * TEX_SIZE; i++) {
    data[i * 4 + 0] = 0;
    data[i * 4 + 1] = 0;
    data[i * 4 + 2] = 0;
    data[i * 4 + 3] = 1;
  }

  return texture;
}

export default function LinearAttractor2DPage() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const paramsRef = useRef(params);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const gpuComputeRef = useRef<GPUComputationRenderer>(null);
  const positionVariableRef = useRef<Variable>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [zoom, setZoom] = useState(1);

  // paramsの最新値をrefに反映
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const initializeUniforms = useCallback((positionVariable: Variable) => {
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
  }, []);

  // 点群を原点に初期化する関数
  const initializeToOrigin = () => {
    if (!gpuComputeRef.current || !rendererRef.current) return;

    const renderer = rendererRef.current;
    const gpuCompute = new GPUComputationRenderer(TEX_SIZE, TEX_SIZE, renderer);
    gpuComputeRef.current = gpuCompute;

    const originTexture = createOriginTexture(gpuCompute);

    const positionVariable = gpuCompute.addVariable(
      "texturePosition",
      computeFragmentShader,
      originTexture,
    );
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable]);

    initializeUniforms(positionVariable);

    const err = gpuCompute.init();
    if (err) {
      alert(`GPGPU初期化エラー: ${err}`);
      return;
    }

    positionVariableRef.current = positionVariable;
  };

  // カメラリセット
  const resetCamera = () => {
    setZoom(1);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 1);
      cameraRef.current.zoom = 1;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  // 初期化
  useEffect(() => {
    if (!canvasRef.current) return;

    // レンダラー
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    rendererRef.current = renderer;

    // シーン
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // カメラ（OrthographicCamera for 2D）
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 2;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      100,
    );
    camera.position.set(0, 0, 1);
    cameraRef.current = camera;

    // マウスホイールでズーム
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1.1 : 0.9;
      setZoom((prev) => Math.max(0.1, Math.min(10, prev * delta)));
    };
    canvasRef.current.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    // マウスドラッグでパン
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cameraRef.current) return;
      const dx = (e.clientX - prevMouse.x) / window.innerWidth;
      const dy = (e.clientY - prevMouse.y) / window.innerHeight;
      const zoomFactor = 2 / cameraRef.current.zoom;
      camera.position.x -= dx * zoomFactor * aspect;
      camera.position.y += dy * zoomFactor;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => {
      isDragging = false;
    };
    canvasRef.current.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // GPGPUセットアップ
    const gpuCompute = new GPUComputationRenderer(TEX_SIZE, TEX_SIZE, renderer);
    gpuComputeRef.current = gpuCompute;
    const posTex = createOriginTexture(gpuCompute);
    const positionVariable = gpuCompute.addVariable(
      "texturePosition",
      computeFragmentShader,
      posTex,
    );
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable]);
    initializeUniforms(positionVariable);
    const err = gpuCompute.init();
    if (err) {
      alert(`GPGPU初期化エラー: ${err}`);
      return;
    }
    positionVariableRef.current = positionVariable;

    // 点群ジオメトリ
    const geometry = new THREE.BufferGeometry();
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
      if (gpuComputeRef.current && positionVariableRef.current) {
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
        material.uniforms.positionTexture.value =
          gpuComputeRef.current.getCurrentRenderTarget(
            positionVariableRef.current,
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
      const aspect = w / h;
      cameraRef.current.left = (frustumSize * aspect) / -2;
      cameraRef.current.right = (frustumSize * aspect) / 2;
      cameraRef.current.top = frustumSize / 2;
      cameraRef.current.bottom = frustumSize / -2;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      canvasRef.current?.removeEventListener("wheel", handleWheel);
      canvasRef.current?.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      geometry.dispose();
      material.dispose();
      scene.remove(points);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeUniforms]);

  // ズーム変更時のカメラ更新
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.zoom = zoom;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [zoom]);

  // パラメータ変更時のuniform更新
  useEffect(() => {
    if (!positionVariableRef.current) return;
    positionVariableRef.current.material.uniforms.uTime.value = 0;
    if (pointsRef.current) {
      (
        pointsRef.current.material as THREE.ShaderMaterial
      ).uniforms.pointSize.value = params.pointSize;
    }
  }, [params.pointSize]);

  return (
    <main className="w-screen h-[calc(100vh-var(--header-height))]">
      <ControlButtons
        onResetControl={resetCamera}
        onReset={() => {
          setParams({ ...DEFAULT_PARAMS });
          resetCamera();
        }}
        onInitializeToOrigin={initializeToOrigin}
        onToggleControlsVisible={() => setControlsVisible((v) => !v)}
        onRandomSample={() => {
          const keys = Object.keys(
            sampleParams,
          ) as (keyof typeof sampleParams)[];
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          setParams((prev) => ({
            ...prev,
            ...sampleParams[randomKey],
          }));
        }}
      />
      {controlsVisible && (
        <div className="absolute bottom-[10px] left-[10px] z-10">
          <div className="bg-[var(--background-color)] p-[10px] border-2 flex flex-row gap-4 mb-[10px]">
            <Slider
              label="点サイズ"
              min={0.001}
              max={0.05}
              step={0.001}
              value={params.pointSize}
              onChange={(v: number) =>
                setParams((prev) => ({
                  ...prev,
                  pointSize: v,
                }))
              }
            />
            <Slider
              label="ズーム"
              min={0.1}
              max={5}
              step={0.1}
              value={zoom}
              onChange={setZoom}
            />
          </div>
          <div className="bg-[var(--background-color)] p-[10px] border-2 flex flex-row gap-4 mb-[10px]">
            {([0, 1, 2, 3] as const).map((i) => (
              <div
                key={`transform-${i}`}
                className="flex flex-col items-start min-w-[220px]"
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
                />
                <MatrixInput2D
                  label={`変換行列${i}`}
                  value={
                    params[
                      `transform${i}` as keyof typeof params
                    ] as THREE.Matrix3
                  }
                  onChange={(m: THREE.Matrix3) =>
                    setParams((prev) => ({
                      ...prev,
                      [`transform${i}`]: m,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <canvas className="w-full h-full block" ref={canvasRef} />
    </main>
  );
}
