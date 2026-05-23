"use client";

import styles from "./Main.module.scss";
import GalleryGridCanvas from "./GalleryGridCanvas";
import type { CompDynamGalleryItem } from "@/app/galleries/compdynam/GalleryData";

interface MainProps {
  items: CompDynamGalleryItem[];
}

export default function Main({ items }: MainProps) {
  return (
    <main className={styles.main}>
      <GalleryGridCanvas items={items} />
    </main>
  );
}
