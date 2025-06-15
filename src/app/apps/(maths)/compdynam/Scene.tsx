import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ShaderMaterial, Vector2 } from "three";
import { OrthographicCamera } from "@react-three/drei";

import { vertexShader } from "./Shaders/VertexShader";
import { fragmentShader } from "./Shaders/FragmentShader";

const CompdynamScene = () => {
  const materialRef = useRef<ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGraph: { value: { origin: new Vector2(0, 0), radius: 2.0 } }, // 描画範囲の半径
      uResolution: { value: new Vector2(1, 1) },
    }),
    []
  );

  // リサイズイベントを監視
  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(
          window.innerWidth,
          window.innerHeight
        );
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uResolution.value.set(
        state.size.width,
        state.size.height
      );
    }
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh>
        <planeGeometry args={[size.width * 16, size.height * 16]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
};

export default CompdynamScene;
