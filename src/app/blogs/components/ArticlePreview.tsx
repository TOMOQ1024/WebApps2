"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { useEffect, useState } from "react";
import { blogMdxOptions } from "@/lib/blogMdxOptions";
import components from "./MDXComponents";

interface ArticlePreviewProps {
  body: string;
}

export default function ArticlePreview({ body }: ArticlePreviewProps) {
  const [compiled, setCompiled] = useState<MDXRemoteSerializeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!body.trim()) {
      setCompiled(null);
      setError(null);
      setIsUpdating(false);
      return;
    }

    setIsUpdating(true);

    const timer = window.setTimeout(async () => {
      try {
        const result = await serialize(body, {
          mdxOptions: blogMdxOptions,
        });

        if (!cancelled) {
          setCompiled(result);
          setError(null);
          setIsUpdating(false);
        }
      } catch (previewError) {
        if (!cancelled) {
          setCompiled(null);
          setError(
            previewError instanceof Error
              ? previewError.message
              : "プレビューの生成に失敗しました",
          );
          setIsUpdating(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [body]);

  return (
    <div className="border-2 border-[var(--border-color)] min-h-[28rem] flex flex-col">
      <div className="px-3 py-2 border-b-2 border-[var(--border-color)] text-sm text-[var(--text-color)] flex items-center justify-between">
        <span>プレビュー</span>
        {isUpdating && body.trim() && (
          <span className="text-xs opacity-70">更新中...</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!body.trim() ? (
          <p className="m-0 text-sm opacity-50">本文を入力するとプレビューが表示されます．</p>
        ) : error ? (
          <div className="p-3 text-sm text-red-600 bg-red-100 border-2 border-red-300 whitespace-pre-wrap">
            {error}
          </div>
        ) : compiled ? (
          <div className="blog-content leading-relaxed">
            <MDXRemote {...compiled} components={components} />
          </div>
        ) : (
          <p className="m-0 text-sm opacity-50">プレビューを生成しています...</p>
        )}
      </div>
    </div>
  );
}
