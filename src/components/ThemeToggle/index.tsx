"use client";

import { useMemo, useRef } from "react";
import ShaderButton, {
  type ShaderButtonUniforms,
} from "@/components/ShaderButton";
import { useTheme } from "@/hooks/useTheme";
import { fragmentShader } from "./Shaders/FragmentShader";
import { vertexShader } from "./Shaders/VertexShader";

const BORDER_WIDTH = 2 / 32; // 正規化された値（2px / 32px）

export default function ThemeToggle() {
  const { theme, themeValue, toggleTheme } = useTheme();
  const themeRef = useRef(themeValue);
  themeRef.current = themeValue;

  const uniforms = useMemo<ShaderButtonUniforms>(
    () => ({
      uTheme: { value: themeValue },
      uBorderWidth: { value: BORDER_WIDTH },
    }),
    [], // 初期値のみ、更新は onFrame で
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
