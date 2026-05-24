import type { BlogPost, BlogPostMeta } from "./blog/types";
import {
  articleToBlogMeta,
  articleToBlogPost,
  getAllBlogTagsStatic,
  getArticleBySlug,
  getPublishedArticleSlugsStatic,
  getPublishedArticles,
} from "./supabase/articles";

export type { BlogPost, BlogPostMeta };

function collectTags(posts: BlogPostMeta[]): string[] {
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const articles = await getPublishedArticles();
  return articles.map(articleToBlogMeta);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const article = await getArticleBySlug(slug);
  if (!article) {
    return null;
  }

  return articleToBlogPost(article);
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPostMeta[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export async function getAllBlogTags(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return collectTags(posts);
}

export async function getAllBlogSlugsForBuild(): Promise<string[]> {
  return getPublishedArticleSlugsStatic();
}

export async function getAllBlogTagsForBuild(): Promise<string[]> {
  return getAllBlogTagsStatic();
}
