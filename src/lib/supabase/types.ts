/**
 * Supabase テーブルの型定義
 */

// タグ
export interface Tag {
  id: number;
  name: string;
}

// アプリ
export interface App {
  id: number;
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
  id: number;
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
  id: number;
  gallery_id: number;
  data: Record<string, unknown>;
  sort_order: number;
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

export interface CompDynamGalleryItem extends Omit<GalleryItem, "data"> {
  data: CompDynamItemData;
}
