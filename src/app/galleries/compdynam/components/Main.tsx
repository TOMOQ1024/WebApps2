"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import styles from "./Main.module.scss";
import GalleryGridCanvas from "./GalleryGridCanvas";

// ギャラリー用のモックデータ型
interface CompDynamGalleryItem {
  id: string;
  title: string;
  functionLatex: string;
  initialValueLatex: string;
  iterations: number;
  center: [number, number];
  radius: number;
}

// モックデータ例
const mockGalleryData: CompDynamGalleryItem[] = [
  {
    id: "mandelbrot",
    title: "マンデルブロ集合",
    functionLatex: "z^2+c",
    initialValueLatex: "0",
    iterations: 50,
    center: [0, 0],
    radius: 2,
  },
  {
    id: "julia",
    title: "ジュリア集合 (0.355+0.355i)",
    functionLatex: "z^2+0.355+0.355i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 2,
  },
  {
    id: "sin",
    title: "sin反復",
    functionLatex: "sin(z)",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 2,
  },
  {
    id: "cos",
    title: "cos反復",
    functionLatex: "cos(z)",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 2,
  },
  {
    id: "exp",
    title: "exp反復",
    functionLatex: "exp(-z)",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 2,
  },
  {
    id: "tan",
    title: "tan反復",
    functionLatex: "\\tanh(z)",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 2,
  },
  // 必要に応じて追加
];

export default function Main() {
  const router = useRouter();
  const gridCols = 3;
  const gridRows = Math.ceil(mockGalleryData.length / gridCols);

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
      <GalleryGridCanvas items={mockGalleryData} onSelect={handleSelect} />
    </main>
  );
}
