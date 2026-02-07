"use server";

import { createClient } from "./server";
import type {
  AppWithTags,
  GalleryWithTags,
  GalleryItem,
  Graph2DGalleryItem,
  CompDynamGalleryItem,
  Tag,
} from "./types";

/**
 * すべてのアプリを取得（タグ付き）
 */
export async function getApps(): Promise<AppWithTags[]> {
  const supabase = await createClient();

  const { data: apps, error: appsError } = await supabase
    .from("apps")
    .select("*")
    .order("sort_order");

  if (appsError) {
    console.error("Error fetching apps:", appsError);
    return [];
  }

  // アプリごとのタグを取得
  const appsWithTags: AppWithTags[] = await Promise.all(
    apps.map(async (app) => {
      const { data: tagRelations } = await supabase
        .from("app_tags")
        .select("tag_id")
        .eq("app_id", app.id);

      if (!tagRelations || tagRelations.length === 0) {
        return { ...app, tags: [] };
      }

      const tagIds = tagRelations.map((r) => r.tag_id);
      const { data: tags } = await supabase
        .from("tags")
        .select("*")
        .in("id", tagIds);

      return { ...app, tags: tags ?? [] };
    })
  );

  return appsWithTags;
}

/**
 * パスからアプリを取得
 */
export async function getAppByPath(path: string): Promise<AppWithTags | null> {
  const supabase = await createClient();

  const { data: app, error } = await supabase
    .from("apps")
    .select("*")
    .eq("path", path)
    .single();

  if (error || !app) {
    return null;
  }

  const { data: tagRelations } = await supabase
    .from("app_tags")
    .select("tag_id")
    .eq("app_id", app.id);

  if (!tagRelations || tagRelations.length === 0) {
    return { ...app, tags: [] };
  }

  const tagIds = tagRelations.map((r) => r.tag_id);
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .in("id", tagIds);

  return { ...app, tags: tags ?? [] };
}

/**
 * すべてのギャラリーを取得（タグ付き）
 */
export async function getGalleries(): Promise<GalleryWithTags[]> {
  const supabase = await createClient();

  const { data: galleries, error } = await supabase
    .from("galleries")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("Error fetching galleries:", error);
    return [];
  }

  const galleriesWithTags: GalleryWithTags[] = await Promise.all(
    galleries.map(async (gallery) => {
      const { data: tagRelations } = await supabase
        .from("gallery_tags")
        .select("tag_id")
        .eq("gallery_id", gallery.id);

      if (!tagRelations || tagRelations.length === 0) {
        return { ...gallery, tags: [] };
      }

      const tagIds = tagRelations.map((r) => r.tag_id);
      const { data: tags } = await supabase
        .from("tags")
        .select("*")
        .in("id", tagIds);

      return { ...gallery, tags: tags ?? [] };
    })
  );

  return galleriesWithTags;
}

/**
 * パスからギャラリーを取得
 */
export async function getGalleryByPath(path: string): Promise<GalleryWithTags | null> {
  const supabase = await createClient();

  const { data: gallery, error } = await supabase
    .from("galleries")
    .select("*")
    .eq("path", path)
    .single();

  if (error || !gallery) {
    return null;
  }

  const { data: tagRelations } = await supabase
    .from("gallery_tags")
    .select("tag_id")
    .eq("gallery_id", gallery.id);

  if (!tagRelations || tagRelations.length === 0) {
    return { ...gallery, tags: [] };
  }

  const tagIds = tagRelations.map((r) => r.tag_id);
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .in("id", tagIds);

  return { ...gallery, tags: tags ?? [] };
}

/**
 * ギャラリー ID からアイテムを取得
 */
export async function getGalleryItemsByGalleryId(galleryId: number): Promise<GalleryItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("gallery_id", galleryId)
    .order("sort_order");

  if (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }

  return data ?? [];
}

/**
 * ギャラリーパスからアイテムを取得
 */
export async function getGalleryItems(galleryPath: string): Promise<GalleryItem[]> {
  const gallery = await getGalleryByPath(galleryPath);
  if (!gallery) {
    console.error(`Gallery not found: ${galleryPath}`);
    return [];
  }
  return getGalleryItemsByGalleryId(gallery.id);
}

/**
 * Graph2D ギャラリーアイテムを取得（型付き）
 */
export async function getGraph2DItems(): Promise<Graph2DGalleryItem[]> {
  const items = await getGalleryItems("graph-2d");
  return items.map((item) => ({
    ...item,
    data: item.data as unknown as Graph2DGalleryItem["data"],
  }));
}

/**
 * CompDynam ギャラリーアイテムを取得（型付き）
 */
export async function getCompDynamItems(): Promise<CompDynamGalleryItem[]> {
  const items = await getGalleryItems("compdynam");
  return items.map((item) => ({
    ...item,
    data: item.data as unknown as CompDynamGalleryItem["data"],
  }));
}

/**
 * すべてのタグを取得
 */
export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data ?? [];
}

/**
 * アプリ一覧を appList 互換形式で取得
 * 既存コードとの互換性のため
 */
export async function getAppListCompat(): Promise<{
  [path: string]: {
    appName: string;
    description?: string;
    tags: Set<string>;
  };
}> {
  const apps = await getApps();
  const result: {
    [path: string]: {
      appName: string;
      description?: string;
      tags: Set<string>;
    };
  } = {};

  for (const app of apps) {
    result[app.path] = {
      appName: app.app_name,
      description: app.description || undefined,
      tags: new Set(app.tags.map((t) => t.name)),
    };
  }

  return result;
}

/**
 * ギャラリー一覧を galleryList 互換形式で取得
 * 既存コードとの互換性のため
 */
export async function getGalleryListCompat(): Promise<{
  [path: string]: {
    galleryName: string;
    description?: string;
    tags: Set<string>;
  };
}> {
  const galleries = await getGalleries();
  const result: {
    [path: string]: {
      galleryName: string;
      description?: string;
      tags: Set<string>;
    };
  } = {};

  for (const gallery of galleries) {
    result[gallery.path] = {
      galleryName: gallery.gallery_name,
      description: gallery.description || undefined,
      tags: new Set(gallery.tags.map((t) => t.name)),
    };
  }

  return result;
}
