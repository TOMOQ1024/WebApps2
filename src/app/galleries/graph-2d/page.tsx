import { getGraph2DItems } from "@/lib/supabase/actions";
import Main from "./components/Main";

export const metadata = {
  title: "Graph 2D Gallery",
};

export default async function Home() {
  const items = await getGraph2DItems();

  // DB の data を GalleryData の形式に変換
  const galleryData = items.map((item) => ({
    expressions: item.data.expressions,
    center: item.data.center,
    radius: item.data.radius,
  }));

  return <Main items={galleryData} />;
}
