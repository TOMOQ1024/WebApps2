"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { X, Plus, Loader2 } from "lucide-react";
import type { Tag, Graph2DItemData } from "@/lib/supabase/types";
import { getTagsForGalleryItems, createTag, createGalleryItem } from "@/lib/supabase/actions";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryData: Graph2DItemData;
  onGalleryDataChange?: (data: Partial<Graph2DItemData>) => void;
  thumbnailDataUrl?: string;
}

export default function PostModal({ isOpen, onClose, galleryData, onGalleryDataChange, thumbnailDataUrl }: PostModalProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingTags, setIsLoadingTags] = useState(true);

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
        : [...prev, tagId]
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
        setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
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
      const result = await createGalleryItem("graph-2d", galleryData, selectedTagIds);
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

        {/* サムネイルプレビュー */}
        <div className="mb-4 flex justify-center">
          {thumbnailDataUrl ? (
            <div className="w-48 h-48 border-2 border-[var(--border-color)] overflow-hidden relative">
              <Image
                src={thumbnailDataUrl}
                alt="プレビュー"
                width={192}
                height={192}
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-48 h-48 border-2 border-[var(--border-color)] flex items-center justify-center text-sm opacity-50">
              プレビューなし
            </div>
          )}
        </div>

        {/* 描画設定 */}
        <div className="mb-4 p-3 bg-[var(--background-color)] border border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-color)] opacity-70 mb-2">描画設定:</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="centerX" className="block text-xs text-[var(--text-color)] opacity-50 mb-1">
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
              <label htmlFor="centerY" className="block text-xs text-[var(--text-color)] opacity-50 mb-1">
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
              <label htmlFor="radius" className="block text-xs text-[var(--text-color)] opacity-50 mb-1">
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
          <p className="text-sm text-[var(--text-color)] opacity-70 mb-2">タグ（任意）:</p>
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
                  className={`px-2 py-1 text-sm border border-[var(--border-color)] transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-[var(--text-color)] text-[var(--background-color)]"
                      : "hover:opacity-70"
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
          className="w-full py-2 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] hover:scale-[0.98] active:invert disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
