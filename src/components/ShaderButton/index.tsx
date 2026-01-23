"use client";

import { View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export interface ShaderButtonUniforms {
  [key: string]: { value: unknown };
}

interface ShaderPlaneProps {
  fragmentShader: string;
  vertexShader: string;
  uniforms: ShaderButtonUniforms;
  onFrame?: (uniforms: ShaderButtonUniforms) => void;
}

function ShaderPlane({
  fragmentShader,
  vertexShader,
  uniforms,
  onFrame,
}: ShaderPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const { viewport, size } = useThree();

  // uniforms に uTime を追加
  const mergedUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      ...uniforms,
    }),
    [uniforms],
  );

  // viewport に合わせてカメラと plane を設定
  useEffect(() => {
    if (cameraRef.current && meshRef.current) {
      // viewport.width/height は Three.js のワールド単位
      const hw = viewport.width / 2;
      const hh = viewport.height / 2;

      cameraRef.current.left = -hw;
      cameraRef.current.right = hw;
      cameraRef.current.top = hh;
      cameraRef.current.bottom = -hh;
      cameraRef.current.updateProjectionMatrix();

      // plane を viewport にフィット
      meshRef.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [viewport.width, viewport.height]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      onFrame?.(materialRef.current.uniforms);
    }
  });

  return (
    <>
      <orthographicCamera
        ref={cameraRef}
        makeDefault
        args={[-1, 1, 1, -1, 0.1, 10]}
        position={[0, 0, 1]}
      />
      <mesh ref={meshRef}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={mergedUniforms}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

interface ShaderButtonProps {
  /** ボタンのサイズ（CSS クラス） */
  className?: string;
  /** フラグメントシェーダー */
  fragmentShader: string;
  /** 頂点シェーダー */
  vertexShader: string;
  /** シェーダーに渡す uniforms */
  uniforms: ShaderButtonUniforms;
  /** クリックハンドラ */
  onClick?: () => void;
  /** アクセシビリティラベル */
  ariaLabel?: string;
  /** 子要素（ボタン上に表示するコンテンツ） */
  children?: ReactNode;
  /** フレームごとの更新コールバック */
  onFrame?: (uniforms: ShaderButtonUniforms) => void;
}

export default function ShaderButton({
  className = "w-8 h-8",
  fragmentShader,
  vertexShader,
  uniforms,
  onClick,
  ariaLabel,
  children,
  onFrame,
}: ShaderButtonProps) {
  return (
    <div className={`relative ${className}`}>
      {/* シェーダー */}
      <View className="absolute inset-0">
        <ShaderPlane
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          onFrame={onFrame}
        />
      </View>
      {/* クリック用ボタン */}
      <button
        type="button"
        onClick={onClick}
        className="absolute inset-0 bg-transparent cursor-pointer"
        style={{ border: "none" }}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    </div>
  );
}
