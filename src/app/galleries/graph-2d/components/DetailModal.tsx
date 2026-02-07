"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import * as THREE from "three";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { fragmentShader as baseFragmentShader } from "@/app/apps/(maths)/graph-2d/Shaders/FragmentShader";
import { vertexShader as baseVertexShader } from "@/app/apps/(maths)/graph-2d/Shaders/VertexShader";
import type { Graph2DGalleryItemWithTags } from "@/app/galleries/graph-2d/GalleryData";
import { useAuth } from "@/components/SupabaseAuthProvider";
import { useTheme } from "@/hooks/useTheme";
import { generateShaderFromExpressions } from "./GalleryGridCanvas";
import {
  updateGalleryItem,
  deleteGalleryItem,
  getTagsForGalleryItems,
  createTag,
} from "@/lib/supabase/actions";
import type { Tag } from "@/lib/supabase/types";

interface DetailModalProps {
  item: Graph2DGalleryItemWithTags;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export default function DetailModal({
  item,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: DetailModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { themeValue } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // 編集モード
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 編集用の状態
  const [editCenter, setEditCenter] = useState<[number, number]>(item.center);
  const [editRadius, setEditRadius] = useState(item.radius);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    item.tags.map((t) => t.id),
  );

  // タグ関連
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [newTagName, setNewTagName] = useState("");

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

  // タグを取得
  const loadTags = useCallback(async () => {
    setIsLoadingTags(true);
    try {
      const tags = await getTagsForGalleryItems();
      setAvailableTags(tags);
    } finally {
      setIsLoadingTags(false);
    }
  }, []);

  // 編集モード開始時にタグを取得
  useEffect(() => {
    if (isEditing && availableTags.length === 0) {
      loadTags();
    }
  }, [isEditing, availableTags.length, loadTags]);

  // モーダルを閉じるときに編集モードをリセット
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setError(null);
      setShowDeleteConfirm(false);
      // 編集値をリセット
      setEditCenter(item.center);
      setEditRadius(item.radius);
      setSelectedTagIds(item.tags.map((t) => t.id));
    }
  }, [isOpen, item]);

  // タグ選択の切り替え
  const handleTagToggle = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }, []);

  // 新規タグ作成
  const handleCreateTag = useCallback(() => {
    if (!newTagName.trim()) return;

    startTransition(async () => {
      const result = await createTag(newTagName.trim(), {
        for_gallery_items: true,
      });

      if (result.success && result.tag) {
        const newTag = result.tag;
        setAvailableTags((prev) => [...prev, newTag]);
        setSelectedTagIds((prev) => [...prev, newTag.id]);
        setNewTagName("");
      } else {
        setError(result.error || "タグの作成に失敗しました");
      }
    });
  }, [newTagName]);

  // 保存
  const handleSave = useCallback(() => {
    setError(null);

    startTransition(async () => {
      const result = await updateGalleryItem(
        item.id,
        {
          expressions: item.expressions,
          center: editCenter,
          radius: editRadius,
        },
        selectedTagIds,
      );

      if (result.success) {
        setIsEditing(false);
        onUpdate?.();
      } else {
        setError(result.error || "更新に失敗しました");
      }
    });
  }, [item.id, item.expressions, editCenter, editRadius, selectedTagIds, onUpdate]);

  // 削除
  const handleDelete = useCallback(() => {
    setError(null);

    startTransition(async () => {
      const result = await deleteGalleryItem(item.id);

      if (result.success) {
        onDelete?.();
        onClose();
      } else {
        setError(result.error || "削除に失敗しました");
      }
    });
  }, [item.id, onDelete, onClose]);

  // WebGL レンダリング用のデータ
  const renderData = useMemo(() => {
    if (isEditing) {
      return { center: editCenter, radius: editRadius };
    }
    return { center: item.center, radius: item.radius };
  }, [isEditing, editCenter, editRadius, item.center, item.radius]);

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
            origin: new THREE.Vector2(renderData.center[0], renderData.center[1]),
            radius: renderData.radius,
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
      // 編集中の値を反映
      material.uniforms.uGraph.value.origin.set(
        renderData.center[0],
        renderData.center[1],
      );
      material.uniforms.uGraph.value.radius = renderData.radius;
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
  }, [isOpen, item.expressions, renderData, themeValue]);

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

        <h2 className="text-lg font-bold mb-4">
          {isEditing ? "作品を編集" : "作品詳細"}
        </h2>

        {/* サムネイル */}
        <div className="mb-4 flex justify-center">
          <div className="w-65 h-65 border-2 border-[var(--border-color)] flex items-center justify-center relative">
            <div ref={containerRef} className="absolute inset-0" />
            {!isRendering && (
              <span className="text-sm opacity-50 z-10">プレビューなし</span>
            )}
          </div>
        </div>

        {/* 描画設定 */}
        <div className="mb-4 p-3 bg-[var(--background-color)] border border-[var(--border-color)]">
          <p className="text-sm font-medium mb-2">描画設定</p>
          {isEditing ? (
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <label htmlFor="edit-center-x" className="block text-xs opacity-50 mb-1">中心 X</label>
                <input
                  id="edit-center-x"
                  type="number"
                  step="0.1"
                  value={editCenter[0]}
                  onChange={(e) =>
                    setEditCenter([Number(e.target.value), editCenter[1]])
                  }
                  className="w-full px-2 py-1 border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
                />
              </div>
              <div>
                <label htmlFor="edit-center-y" className="block text-xs opacity-50 mb-1">中心 Y</label>
                <input
                  id="edit-center-y"
                  type="number"
                  step="0.1"
                  value={editCenter[1]}
                  onChange={(e) =>
                    setEditCenter([editCenter[0], Number(e.target.value)])
                  }
                  className="w-full px-2 py-1 border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
                />
              </div>
              <div>
                <label htmlFor="edit-radius" className="block text-xs opacity-50 mb-1">描画半径</label>
                <input
                  id="edit-radius"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={editRadius}
                  onChange={(e) => setEditRadius(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
                />
              </div>
            </div>
          ) : (
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
          )}
        </div>

        {/* タグ */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">タグ</p>
          {isEditing ? (
            <>
              {isLoadingTags ? (
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <Loader2 size={14} className="animate-spin" />
                  読み込み中...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableTags.map((tag) => (
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
            </>
          ) : item.tags.length > 0 ? (
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
          ) : (
            <p className="text-sm opacity-50">タグなし</p>
          )}
        </div>

        {/* 作成者 */}
        {item.creator_username && (
          <div className="mb-4 text-sm">
            <span className="opacity-50">作成者: </span>
            <span className="font-medium">{item.creator_username}</span>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 border border-red-300">
            {error}
          </div>
        )}

        {/* アクションボタン */}
        {isEditing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 px-4 py-2 border-2 border-[var(--text-color)] font-medium hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditCenter(item.center);
                setEditRadius(item.radius);
                setSelectedTagIds(item.tags.map((t) => t.id));
                setError(null);
              }}
              disabled={isPending}
              className="px-4 py-2 border border-[var(--border-color)] hover:opacity-70 disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        ) : (
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
        )}

        {/* 所有者向け編集・削除ボタン */}
        {isOwner && !isEditing && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex-1 px-3 py-2 text-sm border border-[var(--border-color)] hover:opacity-70 flex items-center justify-center gap-1"
            >
              <Pencil size={14} />
              編集
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-sm border border-red-400 text-red-600 hover:opacity-70 flex items-center justify-center gap-1"
            >
              <Trash2 size={14} />
              削除
            </button>
          </div>
        )}

        {/* 削除確認ダイアログ */}
        {showDeleteConfirm && (
          <div className="mt-4 p-3 border-2 border-red-400 bg-red-50">
            <p className="text-sm text-red-700 mb-3">
              本当にこの作品を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-3 py-2 text-sm bg-red-600 text-white hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    削除中...
                  </>
                ) : (
                  "削除する"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="px-3 py-2 text-sm border border-[var(--border-color)] hover:opacity-70 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
