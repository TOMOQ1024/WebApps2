"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createArticle,
  deleteArticle,
  getTagsForArticlesAction,
  updateArticle,
} from "@/lib/supabase/article-actions";
import { createTag } from "@/lib/supabase/actions";
import type { ArticleStatus, ArticleWithTags, Tag } from "@/lib/supabase/types";
import { BorderedButton } from "@/components/BorderedButton";
import ArticlePreview from "./ArticlePreview";

interface ArticleEditorProps {
  mode: "create" | "edit";
  article?: ArticleWithTags;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ArticleEditor({ mode, article }: ArticleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? "draft");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags.map((tag) => tag.id) ?? [],
  );
  const [newTagName, setNewTagName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsLoadingTags(true);
    getTagsForArticlesAction()
      .then((fetchedTags) => {
        setTags(fetchedTags);
        setIsLoadingTags(false);
      })
      .catch(() => {
        setError("タグの読み込みに失敗しました");
        setIsLoadingTags(false);
      });
  }, []);

  useEffect(() => {
    if (!slugEdited && mode === "create") {
      setSlug(slugify(title));
    }
  }, [title, slugEdited, mode]);

  const filteredTags = useMemo(() => {
    const query = newTagName.trim().toLowerCase();
    if (!query) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tags, newTagName]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    const trimmedName = newTagName.trim().toLowerCase();
    const existingTag = tags.find((tag) => tag.name.toLowerCase() === trimmedName);
    if (existingTag) {
      if (!selectedTagIds.includes(existingTag.id)) {
        setSelectedTagIds((prev) => [...prev, existingTag.id]);
      }
      setNewTagName("");
      setError(null);
      return;
    }

    startTransition(async () => {
      const result = await createTag(newTagName.trim(), {
        for_apps: false,
        for_galleries: false,
        for_gallery_items: false,
        for_articles: true,
      });

      if (result.success && result.tag) {
        const newTag = result.tag;
        const alreadyInList = tags.some((tag) => tag.id === newTag.id);
        if (!alreadyInList) {
          setTags((prev) =>
            [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
        if (!selectedTagIds.includes(newTag.id)) {
          setSelectedTagIds((prev) => [...prev, newTag.id]);
        }
        setNewTagName("");
        setError(null);
      } else {
        setError(result.error || "タグの作成に失敗しました");
      }
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setError(null);
      setSuccessMessage(null);

      const input = {
        title,
        slug,
        description,
        body,
        status,
        tagIds: selectedTagIds,
      };

      const result =
        mode === "create"
          ? await createArticle(input)
          : article
            ? await updateArticle(article.id, input)
            : { success: false, error: "記事が見つかりません" };

      if (result.success) {
        const nextSlug = slugify(slug);
        setSuccessMessage(status === "published" ? "記事を公開しました" : "下書きを保存しました");
        router.push(`/blogs/${nextSlug}`);
        router.refresh();
        return;
      }

      setError(result.error || "保存に失敗しました");
    });
  };

  const handleDelete = () => {
    if (!article) return;
    if (!window.confirm("この記事を削除しますか？")) return;

    startTransition(async () => {
      const result = await deleteArticle(article.id);
      if (result.success) {
        router.push("/blogs");
        router.refresh();
        return;
      }
      setError(result.error || "削除に失敗しました");
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/blogs" className="text-sm text-[var(--text-color)]">
          ← ブログ一覧
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">
          {mode === "create" ? "記事を投稿" : "記事を編集"}
        </h1>
        <p className="text-sm text-[var(--text-color)] m-0">
          Markdown / MDX 形式で記事を書けます．
        </p>
      </div>

      <div className="grid gap-6">
        <div>
          <label htmlFor="title" className="block text-sm mb-2">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full px-3 py-2 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm mb-2">
            スラッグ
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(event.target.value);
            }}
            className="w-full px-3 py-2 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
          />
          <p className="text-xs text-[var(--text-color)] mt-2 m-0">
            URL: /blogs/{slugify(slug) || "..."}
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm mb-2">
            概要
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full px-3 py-2 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
          />
        </div>

        <div>
          <p className="text-sm mb-2">本文</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label htmlFor="body" className="sr-only">
                本文
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={28}
                className="w-full min-h-[28rem] px-3 py-2 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] font-mono text-sm leading-relaxed resize-y"
              />
            </div>
            <ArticlePreview body={body} />
          </div>
        </div>

        <div>
          <p className="text-sm mb-2">タグ（任意）</p>
          {isLoadingTags ? (
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Loader2 size={14} className="animate-spin" />
              読み込み中...
            </div>
          ) : (
            <div className="max-h-32 overflow-y-auto border-2 border-[var(--border-color)] p-2 mb-2">
              <div className="flex flex-wrap gap-2">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
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
                  ))
                ) : newTagName.trim() ? (
                  <span className="text-sm opacity-50">一致するタグがありません</span>
                ) : null}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="タグを検索または作成"
              className="flex-1 px-2 py-1 text-sm border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCreateTag();
                }
              }}
            />
            <BorderedButton
              type="button"
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || isPending}
              size="sm"
              className="px-2"
              aria-label="タグを追加"
            >
              <Plus size={16} />
            </BorderedButton>
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm mb-2">
            公開状態
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ArticleStatus)}
            className="px-3 py-2 border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)]"
          >
            <option value="draft">下書き</option>
            <option value="published">公開</option>
          </select>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 border-2 border-red-300">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-sm text-green-600 bg-green-100 border-2 border-green-300">
            {successMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <BorderedButton
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            active
            className="flex items-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                保存中...
              </>
            ) : status === "published" ? (
              "公開する"
            ) : (
              "下書きを保存"
            )}
          </BorderedButton>

          {mode === "edit" && article && (
            <BorderedButton
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-2 border-red-600 !text-red-600"
            >
              <Trash2 size={16} />
              削除
            </BorderedButton>
          )}
        </div>
      </div>
    </div>
  );
}
