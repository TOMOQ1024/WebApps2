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
    center: [-0.5, 0],
    radius: 1.5,
  },
  {
    id: "julia",
    title: "ジュリア集合 (0.1+0.6i)",
    functionLatex: "z^2+0.1+0.6i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.5,
  },
  {
    id: "sin",
    title: "sin反復",
    functionLatex: "sin(z)",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 5,
  },
  {
    id: "cos",
    title: "cos反復",
    functionLatex: "cos(z)",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 5,
  },
  {
    id: "exp",
    title: "exp反復",
    functionLatex: "e^{-z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [-4, 0],
    radius: 9,
  },
  {
    id: "sinh",
    title: "sinh反復",
    functionLatex: "\\sinh(z)",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 5,
  },
  {
    id: "",
    title: "虹の棘",
    functionLatex: "e^{\\frac{i\\pi }{4}}\\csc z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 4,
  },
  {
    id: "",
    title: "4色の棘",
    functionLatex: "\\frac{\\cos z^2}{9z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 3,
  },
  {
    id: "",
    title: "赤とシアンの波",
    functionLatex: "z+\\tanh z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1,
  },
  {
    id: "",
    title: "緑と紫の波",
    functionLatex: "z+i\\tanh z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 2,
  },
  {
    id: "",
    title: "8のリング",
    functionLatex: "z^7-\\frac{0.472}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    id: "",
    title: "6のリング",
    functionLatex: "z^5-\\frac{0.385}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    id: "",
    title: "4のリング",
    functionLatex: "z^3-\\frac{0.25}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    id: "",
    title: "7の枝分かれ",
    functionLatex: "z^6-\\frac{0.11}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    id: "",
    title: "6の枝分かれ",
    functionLatex: "z^5-\\frac{0.1}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    id: "",
    title: "5の枝分かれ",
    functionLatex: "z^4-\\frac{0.033}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    id: "",
    title: "4の枝分かれ",
    functionLatex: "z^3-\\frac{0.01}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    id: "",
    title: "3の枝分かれ",
    functionLatex: "z^2-\\frac{10^{-6}}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  // https://x.com/TOMOQ8192/status/1748551565932216410
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
