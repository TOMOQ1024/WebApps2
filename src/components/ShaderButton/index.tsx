"use client";

import { OrthographicCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ReactNode, RefObject } from "react";
import { useRef } from "react";
import type { ShaderMaterial } from "three";
import { defaultFragmentShader } from "./Shaders/FragmentShader";
import { defaultVertexShader } from "./Shaders/VertexShader";

interface ShaderPlaneProps {
  fragmentShader?: string;
  vertexShader?: string;
  uniforms?: Record<string, { value: unknown }>;
}

function ShaderPlane({
  fragmentShader = defaultFragmentShader,
  vertexShader = defaultVertexShader,
  uniforms: customUniforms = {},
}: ShaderPlaneProps) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useRef({
    uTime: { value: 0 },
    uResolution: { value: [1, 1] },
    ...customUniforms,
  }).current;

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
}

interface ShaderButtonProps {
  onClick?: () => void;
  className?: string;
  fragmentShader?: string;
  vertexShader?: string;
  uniforms?: Record<string, { value: unknown }>;
  children?: ReactNode;
  style?: React.CSSProperties;
}

export default function ShaderButton({
  onClick,
  className = "",
  fragmentShader,
  vertexShader,
  uniforms,
  children,
  style,
}: ShaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
        <ShaderPlane
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
        />
      </View>
      {children && (
        <span className="relative z-10 pointer-events-none">{children}</span>
      )}
    </button>
  );
}
