"use client";

import { OrthographicCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type * as THREE from "three";
import { useTheme } from "@/hooks/useTheme";
import { fragmentShader } from "../ThemeToggle/Shaders/FragmentShader";
import { vertexShader } from "../ThemeToggle/Shaders/VertexShader";

// ボタンサイズ（ピクセル）
const BUTTON_SIZE = 32;
// ヘッダーの高さ（ピクセル）
const HEADER_HEIGHT = 50;
// ボタンの右からのパディング（md:px-8 = 32px）
const BUTTON_PADDING_RIGHT = 32;

// Canvas 内で直接使用するコンポーネント（export して SharedCanvas から使用）
export function BodyShaderPlane() {
  const { themeValue } = useTheme();
  const themeValueRef = useRef(themeValue);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const { viewport, size, invalidate } = useThree();

  // themeValue が変わるたびに ref を更新
  useEffect(() => {
    themeValueRef.current = themeValue;
  }, [themeValue]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTheme: { value: 0 },
      uAspectRatio: { value: 1 },
      uIconScale: { value: 1 },
      uIconOffset: { value: [0, 0] },
    }),
    [],
  );

  // 初期設定を即座に行う
  useLayoutEffect(() => {
    if (cameraRef.current && meshRef.current) {
      const hw = viewport.width / 2;
      const hh = viewport.height / 2;

      cameraRef.current.left = -hw;
      cameraRef.current.right = hw;
      cameraRef.current.top = hh;
      cameraRef.current.bottom = -hh;
      cameraRef.current.updateProjectionMatrix();

      meshRef.current.scale.set(viewport.width, viewport.height, 1);
    }

    if (materialRef.current && size.width > 0 && size.height > 0) {
      const aspect = size.width / size.height;

      materialRef.current.uniforms.uTheme.value = themeValueRef.current;
      materialRef.current.uniforms.uAspectRatio.value = aspect;

      const iconScale = (BUTTON_SIZE / size.height) * 2;
      materialRef.current.uniforms.uIconScale.value = iconScale;

      const offsetX =
        ((BUTTON_PADDING_RIGHT + BUTTON_SIZE / 2) / size.width) * 2 * aspect;
      const offsetY = (HEADER_HEIGHT / 2 / size.height) * 2;
      materialRef.current.uniforms.uIconOffset.value = [offsetX, offsetY];
    }

    // 強制的に再描画
    invalidate();
  }, [viewport.width, viewport.height, size.width, size.height, invalidate]);

  useFrame(({ clock, viewport, size }) => {
    // viewport を使ってカメラとメッシュを設定
    if (cameraRef.current && meshRef.current) {
      const hw = viewport.width / 2;
      const hh = viewport.height / 2;

      cameraRef.current.left = -hw;
      cameraRef.current.right = hw;
      cameraRef.current.top = hh;
      cameraRef.current.bottom = -hh;
      cameraRef.current.updateProjectionMatrix();

      meshRef.current.scale.set(viewport.width, viewport.height, 1);
    }

    // uniform の計算には size（ピクセル単位）を使用
    if (materialRef.current) {
      const aspect = size.width / size.height;

      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uTheme.value = themeValueRef.current;
      materialRef.current.uniforms.uAspectRatio.value = aspect;

      // アイコンのスケール: ボタンサイズ / 画面高さ（正規化座標での高さ = 2）
      const iconScale = (BUTTON_SIZE / size.height) * 2;
      materialRef.current.uniforms.uIconScale.value = iconScale;

      // アイコンのオフセット（右上からの位置、正規化座標）
      const offsetX =
        ((BUTTON_PADDING_RIGHT + BUTTON_SIZE / 2) / size.width) * 2 * aspect;
      const offsetY = (HEADER_HEIGHT / 2 / size.height) * 2;
      materialRef.current.uniforms.uIconOffset.value = [offsetX, offsetY];
    }
  });

  return (
    <>
      <OrthographicCamera
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
          uniforms={uniforms}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
