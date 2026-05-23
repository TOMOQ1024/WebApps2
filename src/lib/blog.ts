import fs from "fs";
import yaml from "js-yaml";
import path from "path";

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blogs");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
}

interface FrontMatter {
  title?: string;
  date?: string | Date;
  tags?: string[];
  description?: string;
  draft?: boolean;
}

/**
 * frontmatterとコンテンツをパースする
 */
function parseFrontMatter(fileContents: string): {
  data: FrontMatter;
  content: string;
} {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = fileContents.match(frontMatterRegex);

  if (!match) {
    return { data: {}, content: fileContents };
  }

  const frontMatterStr = match[1];
  const content = match[2];

  try {
    const data = yaml.load(frontMatterStr) as FrontMatter;
    return { data: data || {}, content };
  } catch {
    return { data: {}, content: fileContents };
  }
}

/**
 * 日付を文字列に変換
 */
function formatDate(date: string | Date | undefined): string {
  if (!date) return "";
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return String(date);
}

/**
 * 全ブログ記事のメタデータを取得（日付降順でソート）
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_CONTENT_DIR);
  const posts = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const filePath = path.join(BLOG_CONTENT_DIR, file);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = parseFrontMatter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: formatDate(data.date),
        tags: data.tags || [],
        description: data.description || "",
        draft: data.draft || false,
      };
    })
    .filter((post) => !post.draft) // 下書きは一覧から除外
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return posts;
}

/**
 * スラッグから記事を取得
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = parseFrontMatter(fileContents);

  return {
    slug,
    title: data.title || slug,
    date: formatDate(data.date),
    tags: data.tags || [],
    description: data.description || "",
    content,
  };
}

/**
 * 全タグ一覧を取得
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();

  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}

/**
 * タグで記事をフィルタ
 */
export function getPostsByTag(tag: string): BlogPostMeta[] {
  const posts = getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

/**
 * 全スラッグを取得（静的生成用）
 */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_CONTENT_DIR);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}
