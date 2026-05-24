import { createClient } from "./server";
import type { Article, ArticleWithTags, Tag } from "./types";

async function attachTagsToArticles(articles: Article[]): Promise<ArticleWithTags[]> {
  if (articles.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const articleIds = articles.map((article) => article.id);

  const { data: tagRelations } = await supabase
    .from("article_tags")
    .select("article_id, tag_id")
    .in("article_id", articleIds);

  if (!tagRelations || tagRelations.length === 0) {
    return articles.map((article) => ({ ...article, tags: [] }));
  }

  const tagIds = [...new Set(tagRelations.map((relation) => relation.tag_id))];
  const { data: tags } = await supabase.from("tags").select("*").in("id", tagIds);
  const tagMap = new Map((tags ?? []).map((tag) => [tag.id, tag as Tag]));

  return articles.map((article) => {
    const articleTagIds = tagRelations
      .filter((relation) => relation.article_id === article.id)
      .map((relation) => relation.tag_id);

    return {
      ...article,
      tags: articleTagIds
        .map((tagId) => tagMap.get(tagId))
        .filter((tag): tag is Tag => tag !== undefined),
    };
  });
}

function formatArticleDate(article: Article): string {
  const date = article.published_at ?? article.created_at;
  return date ? new Date(date).toISOString().split("T")[0] : "";
}

export function articleToBlogMeta(article: ArticleWithTags) {
  return {
    slug: article.slug,
    title: article.title,
    date: formatArticleDate(article),
    tags: article.tags.map((tag) => tag.name),
    description: article.description,
    source: "db" as const,
    id: article.id,
    status: article.status,
    created_by: article.created_by,
  };
}

export function articleToBlogPost(article: ArticleWithTags) {
  return {
    ...articleToBlogMeta(article),
    content: article.body,
  };
}

/**
 * 公開済み記事を取得
 */
export async function getPublishedArticles(): Promise<ArticleWithTags[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Error fetching published articles:", error);
    return [];
  }

  return attachTagsToArticles((data ?? []) as Article[]);
}

/**
 * 認証ユーザーの記事（下書き含む）を取得
 */
export async function getMyArticles(): Promise<ArticleWithTags[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("created_by", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching my articles:", error);
    return [];
  }

  return attachTagsToArticles((data ?? []) as Article[]);
}

/**
 * スラッグから記事を取得
 */
export async function getArticleBySlug(slug: string): Promise<ArticleWithTags | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  const [article] = await attachTagsToArticles([data as Article]);
  return article ?? null;
}

/**
 * ID から記事を取得
 */
export async function getArticleById(id: string): Promise<ArticleWithTags | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching article by id:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  const [article] = await attachTagsToArticles([data as Article]);
  return article ?? null;
}

/**
 * 公開済み記事のスラッグ一覧
 */
export async function getPublishedArticleSlugs(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published");

  if (error) {
    console.error("Error fetching article slugs:", error);
    return [];
  }

  return (data ?? []).map((article) => article.slug);
}

/**
 * 記事用タグを取得
 */
export async function getTagsForArticles(): Promise<Tag[]> {
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
 * スラッグが既に使用されているか確認
 */
export async function isArticleSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase.from("articles").select("id").eq("slug", slug);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Error checking article slug:", error);
    return true;
  }

  return data !== null;
}
