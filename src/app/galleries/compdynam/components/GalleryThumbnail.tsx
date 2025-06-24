import { useEffect, useRef } from "react";
import * as THREE from "three";
import { fragmentShader } from "@/app/apps/(maths)/compdynam/Shaders/FragmentShader";
import { vertexShader } from "@/app/apps/(maths)/compdynam/Shaders/VertexShader";
import { latexToGLSL } from "@/src/Parser/latexToGLSL";
import GraphMgr from "@/src/GraphMgr";

interface GalleryThumbnailProps {
  functionLatex: string;
  initialValueLatex: string;
  iterations: number;
  style?: React.CSSProperties;
}

export default function GalleryThumbnail({
  functionLatex,
  initialValueLatex,
  iterations,
  style,
}: GalleryThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // 既存のcanvasをクリア
    containerRef.current.innerHTML = "";

    // シェーダー文字列を生成
    let shader = fragmentShader;
    try {
      const functionCode = latexToGLSL(functionLatex, undefined, [
        "z",
        "c",
        "t",
      ]);
      const initialValueCode = latexToGLSL(initialValueLatex, undefined, [
        "c",
        "t",
      ]);
      shader = shader.replace(/z\/\* input func here \*\//, functionCode);
      shader = shader.replace(
        /c\/\* input initial value here \*\//,
        initialValueCode
      );
    } catch (e) {
      // パースエラー時はデフォルト
    }

    // サイズ
    const width = 180;
    const height = 180;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x222222);
    containerRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -width,
      width,
      height,
      -height,
      0.1,
      10
    );
    camera.position.z = 1;

    // グラフ範囲（サムネイル用に固定）
    const graph = new GraphMgr(new THREE.Vector2(0, 0), 2);

    const geometry = new THREE.PlaneGeometry(width * 16, height * 16);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uGraph: { value: { origin: graph.origin, radius: graph.radius } },
        uIterations: { value: iterations },
        uRenderMode: { value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: shader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 1フレームだけ描画
    renderer.render(scene, camera);

    // クリーンアップ
    return () => {
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      scene.remove(mesh);
    };
  }, [functionLatex, initialValueLatex, iterations]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
}
