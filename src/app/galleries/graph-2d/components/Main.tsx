"use client";

import GalleryGridCanvas from "./GalleryGridCanvas";
import type { Graph2DGalleryItem } from "@/app/galleries/graph-2d/GalleryData";

interface MainProps {
  items: Graph2DGalleryItem[];
}

export default function Main({ items }: MainProps) {
  return (
    <main className="relative w-full h-[calc(100vh-var(--header-height))] overflow-hidden">
      <GalleryGridCanvas items={items} />
    </main>
  );
}
