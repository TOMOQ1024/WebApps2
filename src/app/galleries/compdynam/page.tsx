import { getCompDynamItems } from "@/lib/supabase/actions";
import Main from "./components/Main";

export const metadata = {
  title: "CompDynam Gallery",
};

export default async function Home() {
  const items = await getCompDynamItems();

  // DB の data を GalleryData の形式に変換
  const galleryData = items.map((item) => ({
    functionLatex: item.data.functionLatex,
    initialValueLatex: item.data.initialValueLatex,
    iterations: item.data.iterations,
    center: item.data.center,
    radius: item.data.radius,
  }));

  return <Main items={galleryData} />;
}
