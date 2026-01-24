"use client";

import GalleryGridCanvas from "./GalleryGridCanvas";
import { galleryData } from "@/app/galleries/graph-2d/GalleryData";

export default function Main() {
  return (
    <main className="relative w-full h-[calc(100vh-var(--header-height))] overflow-hidden">
      <GalleryGridCanvas items={galleryData} />
    </main>
  );
}
