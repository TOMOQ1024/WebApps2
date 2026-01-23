"use client";

import { useMemo, useRef } from "react";
import ShaderButton, {
  type ShaderButtonUniforms,
} from "@/components/ShaderButton";
import { useTheme } from "@/hooks/useTheme";
import { fragmentShader } from "./Shaders/FragmentShader";
import { vertexShader } from "./Shaders/VertexShader";

export default function ThemeToggle() {
  const { theme, themeValue, toggleTheme } = useTheme();
  const themeRef = useRef(themeValue);
  themeRef.current = themeValue;

  const uniforms = useMemo<ShaderButtonUniforms>(
    () => ({
      uTheme: { value: themeValue },
      uAspectRatio: { value: 1 }, // 正方形
    }),
    [],
  );

  const handleFrame = (u: ShaderButtonUniforms) => {
    u.uTheme.value = themeRef.current;
  };

  return (
    <ShaderButton
      className="w-8 h-8"
      fragmentShader={fragmentShader}
      vertexShader={vertexShader}
      uniforms={uniforms}
      onClick={toggleTheme}
      onFrame={handleFrame}
      ariaLabel={`テーマを切り替え: 現在 ${theme}`}
    />
  );
}
