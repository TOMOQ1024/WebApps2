"use server";

import { createClient } from "./server";
import type { Tag } from "./types";

/** すべてのタグを取得 */
export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("tags").select("*").order("name");

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data ?? [];
}

/** ギャラリーアイテム用のタグを取得 */
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

/** タグを作成 */
export async function createTag(
  name: string,
  options?: {
    for_apps?: boolean;
    for_galleries?: boolean;
    for_gallery_items?: boolean;
    for_articles?: boolean;
  },
): Promise<{ success: boolean; error?: string; tag?: Tag }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: "タグ名を入力してください" };
  }

  const for_apps = options?.for_apps ?? true;
  const for_galleries = options?.for_galleries ?? true;
  const for_gallery_items = options?.for_gallery_items ?? false;
  const for_articles = options?.for_articles ?? false;

  const { data: existingTag } = await supabase
    .from("tags")
    .select("*")
    .eq("name", trimmedName)
    .single();

  if (existingTag) {
    const updateFields: Record<string, boolean> = {};
    if (for_apps && !existingTag.for_apps) updateFields.for_apps = true;
    if (for_galleries && !existingTag.for_galleries)
      updateFields.for_galleries = true;
    if (for_gallery_items && !existingTag.for_gallery_items)
      updateFields.for_gallery_items = true;
    if (for_articles && !existingTag.for_articles)
      updateFields.for_articles = true;

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

    return { success: true, tag: existingTag };
  }

  const { data: newTag, error } = await supabase
    .from("tags")
    .insert({
      name: trimmedName,
      for_apps,
      for_galleries,
      for_gallery_items,
      for_articles,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating tag:", error);
    return { success: false, error: error.message };
  }

  return { success: true, tag: newTag };
}
