"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./server";
import { getArticleById, isArticleSlugTaken } from "./articles";
import type { Article, ArticleStatus, Tag } from "./types";

export interface ArticleInput {
  title: string;
  slug: string;
  description: string;
  body: string;
  status: ArticleStatus;
  tagIds?: string[];
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateArticleInput(input: ArticleInput): string | null {
  const title = input.title.trim();
  const slug = normalizeSlug(input.slug);
  const body = input.body.trim();

  if (!title) {
    return "タイトルを入力してください";
  }

  if (!slug) {
    return "スラッグを入力してください";
  }

  if (!body) {
    return "本文を入力してください";
  }

  if (input.status !== "draft" && input.status !== "published") {
    return "公開状態が不正です";
  }

  return null;
}

async function isSlugConflict(slug: string, excludeId?: string): Promise<boolean> {
  return isArticleSlugTaken(slug, excludeId);
}

async function syncArticleTags(articleId: string, tagIds: string[] | undefined) {
  const supabase = await createClient();

  await supabase.from("article_tags").delete().eq("article_id", articleId);

  if (!tagIds || tagIds.length === 0) {
    return;
  }

  const relations = tagIds.map((tagId) => ({
    article_id: articleId,
    tag_id: tagId,
  }));

  const { error } = await supabase.from("article_tags").insert(relations);
  if (error) {
    console.error("Error syncing article tags:", error);
  }
}

function revalidateArticlePaths(slug: string) {
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${slug}`);
  revalidatePath("/blogs/tags");
}

/**
 * 記事用タグを取得
 */
export async function getTagsForArticlesAction(): Promise<Tag[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("for_articles", true)
    .order("name");

  if (error) {
    console.error("Error fetching tags for articles:", error);
    return [];
  }

  return (data ?? []) as Tag[];
}

/**
 * 記事を作成
 */
export async function createArticle(
  input: ArticleInput,
): Promise<{ success: boolean; error?: string; article?: Article }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const validationError = validateArticleInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const slug = normalizeSlug(input.slug);
  if (await isSlugConflict(slug)) {
    return { success: false, error: "このスラッグは既に使用されています" };
  }

  const now = new Date().toISOString();
  const isPublished = input.status === "published";

  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      slug,
      title: input.title.trim(),
      description: input.description.trim(),
      body: input.body.trim(),
      status: input.status,
      published_at: isPublished ? now : null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !article) {
    console.error("Error creating article:", error);
    return { success: false, error: error?.message ?? "記事の作成に失敗しました" };
  }

  await syncArticleTags(article.id, input.tagIds);
  revalidateArticlePaths(slug);

  return { success: true, article: article as Article };
}

/**
 * 記事を更新（作成者のみ）
 */
export async function updateArticle(
  articleId: string,
  input: ArticleInput,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const existing = await getArticleById(articleId);
  if (!existing) {
    return { success: false, error: "記事が見つかりません" };
  }

  if (existing.created_by !== user.id) {
    return { success: false, error: "この記事を編集する権限がありません" };
  }

  const validationError = validateArticleInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const slug = normalizeSlug(input.slug);
  if (await isSlugConflict(slug, articleId)) {
    return { success: false, error: "このスラッグは既に使用されています" };
  }

  const isPublished = input.status === "published";
  const publishedAt =
    isPublished
      ? existing.published_at ?? new Date().toISOString()
      : null;

  const { error } = await supabase
    .from("articles")
    .update({
      slug,
      title: input.title.trim(),
      description: input.description.trim(),
      body: input.body.trim(),
      status: input.status,
      published_at: publishedAt,
    })
    .eq("id", articleId);

  if (error) {
    console.error("Error updating article:", error);
    return { success: false, error: error.message };
  }

  await syncArticleTags(articleId, input.tagIds);

  if (existing.slug !== slug) {
    revalidatePath(`/blogs/${existing.slug}`);
  }
  revalidateArticlePaths(slug);

  return { success: true };
}

/**
 * 記事を削除（作成者のみ）
 */
export async function deleteArticle(
  articleId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const existing = await getArticleById(articleId);
  if (!existing) {
    return { success: false, error: "記事が見つかりません" };
  }

  if (existing.created_by !== user.id) {
    return { success: false, error: "この記事を削除する権限がありません" };
  }

  await supabase.from("article_tags").delete().eq("article_id", articleId);

  const { error } = await supabase.from("articles").delete().eq("id", articleId);
  if (error) {
    console.error("Error deleting article:", error);
    return { success: false, error: error.message };
  }

  revalidateArticlePaths(existing.slug);
  return { success: true };
}

/**
 * タイトルからスラッグを生成
 */
export async function generateSlugFromTitle(title: string): Promise<string> {
  return normalizeSlug(title);
}
