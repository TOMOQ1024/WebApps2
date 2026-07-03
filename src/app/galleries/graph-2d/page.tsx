import { getGraph2DItemsWithTags } from "@/features/gallery/actions";
import { getTagsForGalleryItems } from "@/shared/supabase/tags";
import Main from "./components/Main";

export const metadata = {
  title: "Graph 2D Gallery",
};

export default async function Home() {
  const [items, availableTags] = await Promise.all([
    getGraph2DItemsWithTags(),
    getTagsForGalleryItems(),
  ]);

  // DB の data を GalleryData の形式に変換（タグ情報も含める）
  const galleryData = items.map((item) => ({
    id: item.id,
    expressions: item.data.expressions,
    center: item.data.center,
    radius: item.data.radius,
    tags: item.tags,
    created_by: item.created_by,
    creator_username: item.creator_username,
  }));

  return <Main items={galleryData} availableTags={availableTags} />;
}
