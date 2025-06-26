"use client";
import styles from "./Main.module.scss";
import GalleryGridCanvas from "./GalleryGridCanvas";
import { galleryData } from "@/app/galleries/compdynam/GalleryData";

export default function Main() {
  return (
    <main className={styles.main}>
      <GalleryGridCanvas items={galleryData} />
    </main>
  );
}
