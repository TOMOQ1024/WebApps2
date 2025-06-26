"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import styles from "./Main.module.scss";
import GalleryGridCanvas from "./GalleryGridCanvas";
import { CompDynamGalleryItem } from "@/app/galleries/compdynam/GalleryData";
import { galleryData } from "@/app/galleries/compdynam/GalleryData";

export default function Main() {
  const router = useRouter();

  // クリックでapps/compdynamに遷移
  const handleSelect = useCallback(
    (item: CompDynamGalleryItem) => {
      const params = new URLSearchParams();
      params.set("function", encodeURIComponent(item.functionLatex));
      params.set("initialValue", encodeURIComponent(item.initialValueLatex));
      params.set("iter", item.iterations.toString());
      params.set("origin", `${item.center[0]},${item.center[1]}`);
      params.set("radius", item.radius.toString());
      router.push(`/apps/compdynam?${params.toString()}`);
    },
    [router]
  );

  return (
    <main className={styles.main}>
      <GalleryGridCanvas items={galleryData} onSelect={handleSelect} />
    </main>
  );
}
