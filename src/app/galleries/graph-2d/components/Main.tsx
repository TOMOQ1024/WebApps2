"use client";

import { useState, useMemo, useCallback } from "react";
import GalleryGridCanvas from "./GalleryGridCanvas";
import DetailModal from "./DetailModal";
import type { Graph2DGalleryItemWithTags } from "@/app/galleries/graph-2d/GalleryData";
import type { Tag } from "@/lib/supabase/types";

interface MainProps {
  items: Graph2DGalleryItemWithTags[];
  availableTags: Tag[];
}

export default function Main({ items, availableTags }: MainProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Graph2DGalleryItemWithTags | null>(null);

  // 選択されたタグでフィルタリング
  const filteredItems = useMemo(() => {
    if (selectedTagIds.length === 0) {
      return items;
    }
    // 選択されたタグのいずれかを持つアイテムを表示
    return items.filter((item) =>
      item.tags.some((tag) => selectedTagIds.includes(tag.id))
    );
  }, [items, selectedTagIds]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleClearFilter = () => {
    setSelectedTagIds([]);
  };

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const handleItemClick = useCallback((item: Graph2DGalleryItemWithTags) => {
    setSelectedItem(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return (
    <main className="relative w-full h-[calc(100vh-var(--header-height))] overflow-hidden">
      {/* タグフィルター（折りたたみ式） */}
      {availableTags.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          {/* トグルボタン */}
          <button
            type="button"
            onClick={toggleFilter}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--background-color)] border-2 border-[var(--border-color)] text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <span>タグ絞り込み</span>
            {selectedTagIds.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-[var(--text-color)] text-[var(--background-color)]">
                {selectedTagIds.length}
              </span>
            )}
            <span
              className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {/* フィルターパネル */}
          {isFilterOpen && (
            <div className="mt-1 p-3 bg-[var(--background-color)] border-2 border-[var(--border-color)] max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs opacity-70">タグを選択</span>
                {selectedTagIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFilter}
                    className="text-xs opacity-70 hover:opacity-100 underline"
                  >
                    クリア
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-2 py-0.5 text-xs border border-[var(--border-color)] transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-[var(--text-color)] text-[var(--background-color)]"
                        : "hover:opacity-70"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {selectedTagIds.length > 0 && (
                <div className="mt-2 text-xs opacity-70">
                  {filteredItems.length} / {items.length} 件表示
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <GalleryGridCanvas items={filteredItems} onItemClick={handleItemClick} />

      {/* 詳細モーダル */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
}
