import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { vertexShader } from "../Shaders/VertexShader";
import { GraphManager, Graph } from "../Controls/GraphManager";
import styles from "./Canvas.module.scss";

interface CanvasProps {
  shader: string;
  onGraphChange: (graph: Graph) => void;
}

export default function Canvas({ shader, onGraphChange }: CanvasProps) {
  const [resolution, setResolution] = useState<THREE.Vector2>(
    new THREE.Vector2(800, 600)
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const graphManagerRef = useRef<GraphManager>(
    new GraphManager(new THREE.Vector2(0, 0), 2)
  );
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const pointersRef = useRef<
    { pointerId: number; clientX: number; clientY: number }[]
  >([]);

  // 初期解像度の設定
  useEffect(() => {
    const newResolution = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight - 50
    );
    setResolution(newResolution);
  }, []);

  // シーンの初期化と更新
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(
      -resolution.x,
      resolution.x,
      resolution.y,
      -resolution.y,
      0.1,
      10
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    rendererRef.current = renderer;
    renderer.setSize(resolution.x, resolution.y);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(
      resolution.x * 16,
      resolution.y * 16
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: resolution,
        },
        uGraph: {
          value: {
            origin: new THREE.Vector2(0, 0),
            radius: 2,
          },
        },
      },
      vertexShader: vertexShader,
      fragmentShader: shader,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    camera.position.z = 1;

    let animationFrameId: number;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      renderer.domElement.setPointerCapture(e.pointerId);
      pointersRef.current.push({
        pointerId: e.pointerId,
        clientX: e.clientX,
        clientY: e.clientY,
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      const pidx = pointersRef.current.findIndex(
        (p) => p.pointerId === e.pointerId
      );
      const p = pointersRef.current[pidx] ?? e;
      const c = pointersRef.current;

      switch (c.length) {
        case 0:
          return;
        case 1:
          const delta = new THREE.Vector2(
            (2 * (e.clientX - p.clientX)) / m,
            (2 * (p.clientY - e.clientY)) / m
          );
          graphManagerRef.current.translate(delta.negate());
          onGraphChange(graphManagerRef.current.getGraph());
          break;
        default:
          const C0 = pidx === 0 ? e : c[0];
          const C1 = pidx === 1 ? e : c[1];
          const pOri = new THREE.Vector2(
            (((c[1].clientX + c[0].clientX) / rect.width - 1) * rect.width) / m,
            (((c[1].clientY + c[0].clientY) / rect.height - 1) * rect.height) /
              m
          );
          const dOri = new THREE.Vector2(
            (((C1.clientX + C0.clientX) / rect.width - 1) * rect.width) / m,
            (((C1.clientY + C0.clientY) / rect.height - 1) * rect.height) / m
          )
            .sub(pOri)
            .multiply({ x: 1, y: -1 });
          const pDelta = Math.hypot(
            (2 * (c[1].clientX - c[0].clientX)) / m,
            (2 * (c[1].clientY - c[0].clientY)) / m
          );
          const nDelta = Math.hypot(
            (2 * (C1.clientX - C0.clientX)) / m,
            (2 * (C1.clientY - C0.clientY)) / m
          );
          graphManagerRef.current.translate(dOri.negate());
          graphManagerRef.current.zoom(Math.log(pDelta / nDelta) * 500, pOri);
          onGraphChange(graphManagerRef.current.getGraph());
          break;
      }

      if (0 <= pidx) {
        pointersRef.current[pidx] = {
          pointerId: e.pointerId,
          clientX: e.clientX,
          clientY: e.clientY,
        };
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      renderer.domElement.releasePointerCapture(e.pointerId);
      pointersRef.current.splice(
        pointersRef.current.findIndex((p) => p.pointerId === e.pointerId),
        1
      );
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      const m = Math.min(rect.width, rect.height);
      const c = new THREE.Vector2(
        ((((event.clientX - rect.left) / rect.width) * 2 - 1) * rect.width) / m,
        ((((event.clientY - rect.top) / rect.height) * 2 - 1) * rect.height) / m
      );
      graphManagerRef.current.zoom(event.deltaY, c.negate());
      onGraphChange(graphManagerRef.current.getGraph());
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown, {
      passive: false,
    });
    renderer.domElement.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    renderer.domElement.addEventListener("pointerup", handlePointerUp, {
      passive: false,
    });
    renderer.domElement.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += 0.01;
        const graph = graphManagerRef.current.getGraph();
        materialRef.current.uniforms.uGraph.value.origin.set(
          graph.origin.x,
          graph.origin.y
        );
        materialRef.current.uniforms.uGraph.value.radius = graph.radius;
      }
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    const handleResize = () => {
      const newResolution = new THREE.Vector2(
        window.innerWidth,
        window.innerHeight - 50
      );

      if (cameraRef.current) {
        cameraRef.current.left = -newResolution.x;
        cameraRef.current.right = newResolution.x;
        cameraRef.current.top = newResolution.y;
        cameraRef.current.bottom = -newResolution.y;
        cameraRef.current.updateProjectionMatrix();
      }

      if (rendererRef.current) {
        rendererRef.current.setSize(newResolution.x, newResolution.y);
      }

      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(
          newResolution.x,
          newResolution.y
        );
      }

      setResolution(newResolution);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(animationFrameId);
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [shader, onGraphChange, resolution]);

  return <div ref={containerRef} className={styles.canvas} />;
}
