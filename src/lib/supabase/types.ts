/**
 * Supabase テーブルの型定義
 * id は NanoID (12文字の文字列)
 */

// タグ
export interface Tag {
  id: string;
  name: string;
  for_apps?: boolean;
  for_galleries?: boolean;
  for_gallery_items?: boolean;
  for_articles?: boolean;
}

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  status: ArticleStatus;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithTags extends Article {
  tags: Tag[];
}

// アプリ
export interface App {
  id: string;
  path: string;
  app_name: string;
  description: string;
  sort_order: number;
}

export interface AppWithTags extends App {
  tags: Tag[];
}

// ギャラリー
export interface Gallery {
  id: string;
  path: string;
  gallery_name: string;
  description: string;
  sort_order: number;
}

export interface GalleryWithTags extends Gallery {
  tags: Tag[];
}

// ギャラリーアイテム
export interface GalleryItem {
  id: string;
  gallery_id: string;
  data: Record<string, unknown>;
  sort_order: number;
  created_by?: string | null; // auth.users の UUID
}

export interface GalleryItemWithTags extends GalleryItem {
  tags: Tag[];
}

// Graph2D アイテムの data 型
export interface Graph2DItemData {
  expressions: string[];
  center: [number, number];
  radius: number;
}

// CompDynam アイテムの data 型
export interface CompDynamItemData {
  functionLatex: string;
  initialValueLatex: string;
  iterations: number;
  center: [number, number];
  radius: number;
}

// 型付きギャラリーアイテム
export interface Graph2DGalleryItem extends Omit<GalleryItem, "data"> {
  data: Graph2DItemData;
}

export interface Graph2DGalleryItemWithTags extends Graph2DGalleryItem {
  tags: Tag[];
  creator_username?: string | null; // 作成者のユーザー名
}

export interface CompDynamGalleryItem extends Omit<GalleryItem, "data"> {
  data: CompDynamItemData;
}

export interface CompDynamGalleryItemWithTags extends CompDynamGalleryItem {
  tags: Tag[];
}
