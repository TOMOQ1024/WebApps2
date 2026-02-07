/**
 * Supabase テーブルの型定義
 * id は NanoID (12文字の文字列)
 */

// タグ
export interface Tag {
  id: string;
  name: string;
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
