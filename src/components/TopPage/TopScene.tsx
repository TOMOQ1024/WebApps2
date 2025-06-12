import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, ShaderMaterial } from "three";
import { vertexShader } from "./Shaders/VertexShader";
import { fragmentShader } from "./Shaders/FragmentShader";

interface TopSceneProps {
  scrollY: number;
}

const TopScene = ({ scrollY }: TopSceneProps) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uRadius: { value: 2.0 }, // 描画範囲の半径
      uResolution: {
        value: [
          typeof window !== "undefined" ? window.innerWidth : 1920,
          typeof window !== "undefined" ? window.innerHeight : 1080,
        ],
      },
    }),
    []
  );

  // リサイズイベントを監視
  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value = [
          window.innerWidth,
          window.innerHeight,
        ];
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScroll.value = scrollY;
    }
  });

  return (
    <>
      {/* 環境光 */}
      <ambientLight intensity={0.5} />

      {/* メインのポリゴン（全画面プレーン） */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
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

export default TopScene;
