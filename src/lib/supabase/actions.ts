"use server";

import { createClient } from "./server";
import type {
  AppWithTags,
  GalleryWithTags,
  GalleryItem,
  Graph2DGalleryItem,
  Graph2DGalleryItemWithTags,
  Graph2DItemData,
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
export async function getGalleryItemsByGalleryId(galleryId: string): Promise<GalleryItem[]> {
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
 * Graph2D ギャラリーアイテムを取得（タグ付き）
 */
export async function getGraph2DItemsWithTags(): Promise<Graph2DGalleryItemWithTags[]> {
  const supabase = await createClient();
  const items = await getGraph2DItems();

  // 各アイテムのタグと作成者名を取得
  const itemsWithTags: Graph2DGalleryItemWithTags[] = await Promise.all(
    items.map(async (item) => {
      // タグを取得
      const { data: tagRelations } = await supabase
        .from("gallery_item_tags")
        .select("tag_id")
        .eq("gallery_item_id", item.id);

      let tags: Tag[] = [];
      if (tagRelations && tagRelations.length > 0) {
        const tagIds = tagRelations.map((r) => r.tag_id);
        const { data: fetchedTags } = await supabase
          .from("tags")
          .select("*")
          .in("id", tagIds);
        tags = fetchedTags ?? [];
      }

      // 作成者のユーザー名を取得
      let creator_username: string | null = null;
      if (item.created_by) {
        const { data: username } = await supabase.rpc("get_username", {
          user_id: item.created_by,
        });
        creator_username = username;
      }

      return { ...item, tags, creator_username };
    })
  );

  return itemsWithTags;
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
 * ギャラリーアイテム用のタグを取得
 */
export async function getTagsForGalleryItems(): Promise<Tag[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("for_gallery_items", true)
    .order("name");

  if (error) {
    console.error("Error fetching tags for gallery items:", error);
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

/**
 * ギャラリーアイテムを作成
 */
export async function createGalleryItem(
  galleryPath: string,
  data: Graph2DItemData,
  tagIds?: string[]
): Promise<{ success: boolean; error?: string; item?: GalleryItem }> {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  // ギャラリーを取得
  const gallery = await getGalleryByPath(galleryPath);
  if (!gallery) {
    return { success: false, error: `ギャラリーが見つかりません: ${galleryPath}` };
  }

  // 現在の最大 sort_order を取得
  const { data: existingItems } = await supabase
    .from("gallery_items")
    .select("sort_order")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingItems && existingItems.length > 0
    ? existingItems[0].sort_order + 1
    : 0;

  // アイテムを作成
  const { data: newItem, error } = await supabase
    .from("gallery_items")
    .insert({
      gallery_id: gallery.id,
      data: data as unknown as Record<string, unknown>,
      sort_order: nextSortOrder,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating gallery item:", error);
    return { success: false, error: error.message };
  }

  // タグを紐付け
  if (tagIds && tagIds.length > 0) {
    const tagRelations = tagIds.map((tagId) => ({
      gallery_item_id: newItem.id,
      tag_id: tagId,
    }));

    const { error: tagError } = await supabase
      .from("gallery_item_tags")
      .insert(tagRelations);

    if (tagError) {
      console.error("Error creating gallery item tags:", tagError);
      // タグの紐付けに失敗してもアイテム自体は作成済みなので成功扱い
    }
  }

  return { success: true, item: newItem };
}

/**
 * タグを作成
 */
export async function createTag(
  name: string,
  options?: {
    for_apps?: boolean;
    for_galleries?: boolean;
    for_gallery_items?: boolean;
  }
): Promise<{ success: boolean; error?: string; tag?: Tag }> {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  // タグ名のバリデーション
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: "タグ名を入力してください" };
  }

  // スコープフラグの設定（デフォルト値）
  const for_apps = options?.for_apps ?? true;
  const for_galleries = options?.for_galleries ?? true;
  const for_gallery_items = options?.for_gallery_items ?? false;

  // 既存タグのチェック
  const { data: existingTag } = await supabase
    .from("tags")
    .select("*")
    .eq("name", trimmedName)
    .single();

  if (existingTag) {
    // 既存タグがある場合，必要なスコープフラグを追加更新
    const updateFields: Record<string, boolean> = {};
    if (for_apps && !existingTag.for_apps) updateFields.for_apps = true;
    if (for_galleries && !existingTag.for_galleries) updateFields.for_galleries = true;
    if (for_gallery_items && !existingTag.for_gallery_items) updateFields.for_gallery_items = true;

    if (Object.keys(updateFields).length > 0) {
      const { data: updatedTag, error: updateError } = await supabase
        .from("tags")
        .update(updateFields)
        .eq("id", existingTag.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating tag:", updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, tag: updatedTag };
    }

    // 更新不要な場合はそのまま返す
    return { success: true, tag: existingTag };
  }

  // タグを作成
  const { data: newTag, error } = await supabase
    .from("tags")
    .insert({
      name: trimmedName,
      for_apps,
      for_galleries,
      for_gallery_items,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating tag:", error);
    return { success: false, error: error.message };
  }

  return { success: true, tag: newTag };
}
