import NotFoundPage from "@/components/NotFoundPage";
import { getGalleryPaths } from "@/lib/supabase/actions";

export const metadata = {
  title: "404 Not Found - tomoq.net",
};

export default async function Home() {
  const galleryPaths = await getGalleryPaths();

  return <NotFoundPage galleryPaths={galleryPaths} />;
}
