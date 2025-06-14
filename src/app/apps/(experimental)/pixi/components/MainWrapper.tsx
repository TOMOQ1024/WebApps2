"use client";
import dynamic from "next/dynamic";

const PixiTemplateNoSSR = dynamic(() => import("./PixiTemplate"), {
  ssr: false,
});

export default function MainWrapper() {
  return (
    <main id="main-wrapper">
      <PixiTemplateNoSSR />
    </main>
  );
}
