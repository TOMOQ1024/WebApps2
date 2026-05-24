import {
  getAllPosts as getFilePosts,
  getPostBySlug as getFilePostBySlug,
  type BlogPost,
  type BlogPostMeta,
} from "./blog";
import {
  articleToBlogMeta,
  articleToBlogPost,
  getArticleBySlug,
  getPublishedArticles,
} from "./supabase/articles";

export type BlogPostSource = "mdx" | "db";

export interface UnifiedBlogPostMeta extends BlogPostMeta {
  source: BlogPostSource;
  id?: string;
  status?: "draft" | "published";
  created_by?: string | null;
}

export interface UnifiedBlogPost extends BlogPost {
  source: BlogPostSource;
  id?: string;
  status?: "draft" | "published";
}

function sortPostsByDate(posts: UnifiedBlogPostMeta[]): UnifiedBlogPostMeta[] {
  return [...posts].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

function collectTags(posts: UnifiedBlogPostMeta[]): string[] {
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export async function getAllUnifiedPosts(): Promise<UnifiedBlogPostMeta[]> {
  const filePosts: UnifiedBlogPostMeta[] = getFilePosts().map((post) => ({
    ...post,
    source: "mdx",
  }));

  const dbPosts = (await getPublishedArticles()).map(articleToBlogMeta);
  const dbSlugs = new Set(dbPosts.map((post) => post.slug));

  const merged = [
    ...filePosts.filter((post) => !dbSlugs.has(post.slug)),
    ...dbPosts,
  ];

  return sortPostsByDate(merged);
}

export async function getUnifiedPostBySlug(
  slug: string,
): Promise<UnifiedBlogPost | null> {
  const filePost = getFilePostBySlug(slug);
  if (filePost) {
    return { ...filePost, source: "mdx" };
  }

  const dbArticle = await getArticleBySlug(slug);
  if (!dbArticle) {
    return null;
  }

  return articleToBlogPost(dbArticle);
}

export async function getUnifiedPostsByTag(tag: string): Promise<UnifiedBlogPostMeta[]> {
  const posts = await getAllUnifiedPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export async function getAllUnifiedTags(): Promise<string[]> {
  const posts = await getAllUnifiedPosts();
  return collectTags(posts);
}
