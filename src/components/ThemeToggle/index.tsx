"use client";

import { View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { ShaderMaterial } from "three";
import { useTheme } from "@/hooks/useTheme";
import { fragmentShader } from "./Shaders/FragmentShader";
import { vertexShader } from "./Shaders/VertexShader";

function ShaderPlane({ themeValue }: { themeValue: number }) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useRef({
    uTime: { value: 0 },
    uTheme: { value: themeValue },
  }).current;

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uTheme.value = themeValue;
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const themeValue = theme === "dark" ? 2 : theme === "light" ? 1 : 0;

  return (
    <>
      {/* View は position: fixed でヘッダーの右上に配置 */}
      <View
        style={{
          position: "fixed",
          top: 9,
          right: 32,
          width: 32,
          height: 32,
          pointerEvents: "none",
        }}
      >
        <ShaderPlane themeValue={themeValue} />
      </View>
      {/* クリック用のボタン */}
      <button
        type="button"
        onClick={toggleTheme}
        className="relative w-8 h-8 p-0 bg-transparent cursor-pointer"
        style={{ border: "none" }}
        aria-label={`テーマを切り替え: 現在 ${theme}`}
      />
    </>
  );
}
