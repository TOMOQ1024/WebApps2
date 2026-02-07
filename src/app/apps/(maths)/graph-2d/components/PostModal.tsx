"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import * as THREE from "three";
import { fragmentShader as baseFragmentShader } from "@/app/apps/(maths)/graph-2d/Shaders/FragmentShader";
import { vertexShader as baseVertexShader } from "@/app/apps/(maths)/graph-2d/Shaders/VertexShader";
import { generateShaderFromExpressions } from "@/app/galleries/graph-2d/components/GalleryGridCanvas";
import { useTheme } from "@/hooks/useTheme";
import {
  createGalleryItem,
  createTag,
  getTagsForGalleryItems,
} from "@/lib/supabase/actions";
import type { Graph2DItemData, Tag } from "@/lib/supabase/types";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryData: Graph2DItemData;
  onGalleryDataChange?: (data: Partial<Graph2DItemData>) => void;
}

export default function PostModal({
  isOpen,
  onClose,
  galleryData,
  onGalleryDataChange,
}: PostModalProps) {
  const { themeValue } = useTheme();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isRendering, setIsRendering] = useState(false);

  // WebGL 関連の ref
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // ローカル編集用の状態
  const [centerX, setCenterX] = useState(galleryData.center[0].toString());
  const [centerY, setCenterY] = useState(galleryData.center[1].toString());
  const [radius, setRadius] = useState(galleryData.radius.toString());

  // galleryData が変わったらローカル状態を更新
  useEffect(() => {
    setCenterX(galleryData.center[0].toString());
    setCenterY(galleryData.center[1].toString());
    setRadius(galleryData.radius.toString());
  }, [galleryData.center, galleryData.radius]);

  // WebGL レンダリング
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;

    // シェーダー生成
    let fragmentShader = baseFragmentShader;
    let exprType = 0;
    try {
      const result = generateShaderFromExpressions(
        galleryData.expressions,
        baseFragmentShader,
      );
      fragmentShader = result.shader;
      exprType = result.exprType;
    } catch {
      setIsRendering(false);
      return;
    }

    setIsRendering(true);

    const size = 192;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(size, size);
    const canvas = renderer.domElement;

    // 既存の canvas を安全に削除
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(canvas);
    rendererRef.current = renderer;

    const halfSize = size / 2;
    const scene = new THREE.Scene();
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
            origin: new THREE.Vector2(
              galleryData.center[0],
              galleryData.center[1],
            ),
            radius: galleryData.radius,
          },
        },
        uIterations: { value: 50 },
        uRenderMode: { value: exprType === 1 ? 2 : 0 },
        uExprType: { value: exprType },
      },
    });

    const geometry = new THREE.PlaneGeometry(size, size);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const startTime = performance.now();
    function animate() {
      const elapsed = (performance.now() - startTime) / 1000;
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uTheme.value = themeValue;
      // galleryData の変更を反映
      material.uniforms.uGraph.value.origin.set(
        galleryData.center[0],
        galleryData.center[1],
      );
      material.uniforms.uGraph.value.radius = galleryData.radius;
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
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [
    isOpen,
    galleryData.expressions,
    galleryData.center,
    galleryData.radius,
    themeValue,
  ]);

  // タグを読み込む（ギャラリーアイテム用タグのみ）
  useEffect(() => {
    if (isOpen) {
      setIsLoadingTags(true);
      getTagsForGalleryItems()
        .then((fetchedTags) => {
          setTags(fetchedTags);
          setIsLoadingTags(false);
        })
        .catch(() => {
          setError("タグの読み込みに失敗しました");
          setIsLoadingTags(false);
        });
    }
  }, [isOpen]);

  // モーダルを閉じる時にリセット
  useEffect(() => {
    if (!isOpen) {
      setSelectedTagIds([]);
      setNewTagName("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // 座標・半径が変更されたら親に通知
  const handleCenterXChange = (value: string) => {
    setCenterX(value);
    const num = parseFloat(value);
    if (!Number.isNaN(num) && onGalleryDataChange) {
      onGalleryDataChange({ center: [num, galleryData.center[1]] });
    }
  };

  const handleCenterYChange = (value: string) => {
    setCenterY(value);
    const num = parseFloat(value);
    if (!Number.isNaN(num) && onGalleryDataChange) {
      onGalleryDataChange({ center: [galleryData.center[0], num] });
    }
  };

  const handleRadiusChange = (value: string) => {
    setRadius(value);
    const num = parseFloat(value);
    if (!Number.isNaN(num) && num > 0 && onGalleryDataChange) {
      onGalleryDataChange({ radius: num });
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    startTransition(async () => {
      // ギャラリーアイテム用タグとして作成
      const result = await createTag(newTagName.trim(), {
        for_apps: false,
        for_galleries: false,
        for_gallery_items: true,
      });
      if (result.success && result.tag) {
        const newTag = result.tag;
        setTags((prev) =>
          [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setSelectedTagIds((prev) => [...prev, newTag.id]);
        setNewTagName("");
        setError(null);
      } else {
        setError(result.error || "タグの作成に失敗しました");
      }
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      // タグIDも一緒に保存
      const result = await createGalleryItem(
        "graph-2d",
        galleryData,
        selectedTagIds,
      );
      if (result.success) {
        setSuccess(true);
        setError(null);
        // 成功後，少し待ってから閉じる
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || "投稿に失敗しました");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 cursor-default"
        onClick={onClose}
        aria-label="モーダルを閉じる"
      />

      {/* モーダル */}
      <div className="relative z-10 w-full max-w-md bg-[var(--background-color)] border-2 border-[var(--border-color)] p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">ギャラリーに投稿</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:opacity-70"
          >
            <X size={20} />
          </button>
        </div>

        {/* サムネイルプレビュー（WebGL） */}
        <div className="mb-4 flex justify-center">
          <div className="w-49 h-49 border-2 border-[var(--border-color)] flex items-center justify-center relative">
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
          <p className="text-sm text-[var(--text-color)] opacity-70 mb-2">
            描画設定:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label
                htmlFor="centerX"
                className="block text-xs text-[var(--text-color)] opacity-50 mb-1"
              >
                中心 X
              </label>
              <input
                id="centerX"
                type="number"
                step="any"
                value={centerX}
                onChange={(e) => handleCenterXChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
              />
            </div>
            <div>
              <label
                htmlFor="centerY"
                className="block text-xs text-[var(--text-color)] opacity-50 mb-1"
              >
                中心 Y
              </label>
              <input
                id="centerY"
                type="number"
                step="any"
                value={centerY}
                onChange={(e) => handleCenterYChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
              />
            </div>
            <div>
              <label
                htmlFor="radius"
                className="block text-xs text-[var(--text-color)] opacity-50 mb-1"
              >
                描画半径
              </label>
              <input
                id="radius"
                type="number"
                step="any"
                min="0.001"
                value={radius}
                onChange={(e) => handleRadiusChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
              />
            </div>
          </div>
        </div>

        {/* タグ選択 */}
        <div className="mb-4">
          <p className="text-sm text-[var(--text-color)] opacity-70 mb-2">
            タグ（任意）:
          </p>
          {isLoadingTags ? (
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Loader2 size={14} className="animate-spin" />
              読み込み中...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-2 py-1 text-sm border-2 ${
                    selectedTagIds.includes(tag.id)
                      ? "border-[var(--text-color)] font-bold"
                      : "border-[var(--border-color)] hover:opacity-70"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}

          {/* 新規タグ作成 */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="新しいタグを作成"
              className="flex-1 px-2 py-1 text-sm border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || isPending}
              className="px-2 py-1 border border-[var(--border-color)] hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 border border-red-300">
            {error}
          </div>
        )}

        {/* 成功表示 */}
        {success && (
          <div className="mb-4 p-2 text-sm text-green-600 bg-green-100 border border-green-300">
            投稿しました
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || success}
          className="w-full py-2 border-2 border-[var(--text-color)] bg-[var(--background-color)] text-[var(--text-color)] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              投稿中...
            </>
          ) : success ? (
            "投稿完了"
          ) : (
            "投稿する"
          )}
        </button>
      </div>
    </div>
  );
}
