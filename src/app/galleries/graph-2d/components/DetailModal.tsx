"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { fragmentShader as baseFragmentShader } from "@/app/apps/(maths)/graph-2d/Shaders/FragmentShader";
import { vertexShader as baseVertexShader } from "@/app/apps/(maths)/graph-2d/Shaders/VertexShader";
import type { Graph2DGalleryItemWithTags } from "@/app/galleries/graph-2d/GalleryData";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { useTheme } from "@/hooks/useTheme";
import { generateShaderFromExpressions } from "./GalleryGridCanvas";

interface DetailModalProps {
  item: Graph2DGalleryItemWithTags;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetailModal({
  item,
  isOpen,
  onClose,
}: DetailModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { themeValue } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const isOwner = useMemo(() => {
    return user?.id === item.created_by;
  }, [user, item.created_by]);

  // アプリへ遷移
  const handleGoToApp = useCallback(() => {
    const params = new URLSearchParams();
    const expressionsStr = item.expressions.join(";");
    params.set("expr", encodeURIComponent(expressionsStr));
    params.set("origin", `${item.center[0]},${item.center[1]}`);
    params.set("radius", item.radius.toString());
    router.push(`/apps/graph-2d?${params.toString()}`);
  }, [item, router]);

  // WebGL レンダリング
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;

    // シェーダー生成
    let fragmentShader = baseFragmentShader;
    let exprType = 0;
    try {
      const result = generateShaderFromExpressions(
        item.expressions,
        baseFragmentShader,
      );
      fragmentShader = result.shader;
      exprType = result.exprType;
    } catch {
      setIsRendering(false);
      return;
    }

    setIsRendering(true);

    const size = 256;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(size, size);
    const canvas = renderer.domElement;

    // 既存の canvas を安全に削除
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(canvas);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    // カメラをジオメトリサイズに合わせる
    const halfSize = size / 2;
    const camera = new THREE.OrthographicCamera(
      -halfSize,
      halfSize,
      halfSize,
      -halfSize,
      0,
      1,
    );

    const material = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uTheme: { value: themeValue },
        uResolution: { value: new THREE.Vector2(halfSize, halfSize) },
        uGraph: {
          value: {
            origin: new THREE.Vector2(item.center[0], item.center[1]),
            radius: item.radius,
          },
        },
        uIterations: { value: 50 },
        uRenderMode: { value: exprType === 1 ? 2 : 0 },
        uExprType: { value: exprType },
      },
    });

    // ジオメトリサイズを uResolution に合わせる
    const geometry = new THREE.PlaneGeometry(size, size);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const startTime = performance.now();
    function animate() {
      const elapsed = (performance.now() - startTime) / 1000;
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uTheme.value = themeValue;
      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      // canvas が container の子である場合のみ削除
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [isOpen, item, themeValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="閉じる"
      />

      {/* モーダルコンテンツ */}
      <div className="relative bg-[var(--background-color)] border-2 border-[var(--border-color)] p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 閉じるボタン */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-xl opacity-70 hover:opacity-100"
          aria-label="閉じる"
        >
          ×
        </button>

        <h2 className="text-lg font-bold mb-4">作品詳細</h2>

        {/* サムネイル */}
        <div className="mb-4 flex justify-center">
          <div className="w-65 h-65 border-2 border-[var(--border-color)] flex items-center justify-center relative">
            {/* WebGL canvas コンテナ */}
            <div ref={containerRef} className="absolute inset-0" />
            {/* フォールバックテキスト */}
            {!isRendering && (
              <span className="text-sm opacity-50 z-10">プレビューなし</span>
            )}
          </div>
        </div>

        {/* 描画設定 */}
        <div className="mb-4 p-3 bg-[var(--background-color)] border border-[var(--border-color)]">
          <p className="text-sm font-medium mb-2">描画設定</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="block text-xs opacity-50">中心 X</span>
              <span>{item.center[0]}</span>
            </div>
            <div>
              <span className="block text-xs opacity-50">中心 Y</span>
              <span>{item.center[1]}</span>
            </div>
            <div>
              <span className="block text-xs opacity-50">描画半径</span>
              <span>{item.radius}</span>
            </div>
          </div>
        </div>

        {/* タグ */}
        {item.tags.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">タグ</p>
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-xs border border-[var(--border-color)]"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGoToApp}
            className="flex-1 px-4 py-2 border-2 border-[var(--text-color)] font-medium hover:opacity-80"
          >
            アプリで開く
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[var(--border-color)] hover:opacity-70"
          >
            閉じる
          </button>
        </div>

        {/* 所有者表示（編集機能は後回し） */}
        {isOwner && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <p className="text-xs opacity-50">
              あなたが作成した作品です（編集機能は後日実装予定）
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
