/**
 * Graph 2D ギャラリーアイテムの型定義
 *
 * expressions: 関数定義（複数可）+ 最後に不等式1つ
 * - 関数定義: "f\\left(x\\right)=x^2" や "g\\left(a,b\\right)=a^2+b^2"
 * - 不等式: "x^2+y^2<1" や "f\\left(x\\right)+g\\left(y\\right)<1"
 */
export interface Graph2DGalleryItem {
  expressions: string[];
  center: [number, number];
  radius: number;
}

// 使用例（コメントアウト）
// const exampleData: Graph2DGalleryItem[] = [
//   {
//     // 単純な不等式
//     expressions: ["x^2+y^2<1"],
//     center: [0, 0],
//     radius: 2,
//   },
//   {
//     // 1引数関数を定義して使用
//     expressions: [
//       "f\\left(t\\right)=t^2",
//       "f\\left(x\\right)+f\\left(y\\right)<1"
//     ],
//     center: [0, 0],
//     radius: 2,
//   },
//   {
//     // 複数引数関数を定義して使用
//     expressions: [
//       "g\\left(a,b\\right)=a^2+b^2",
//       "g\\left(x,y\\right)<1"
//     ],
//     center: [0, 0],
//     radius: 2,
//   },
//   {
//     // 複数の関数定義
//     expressions: [
//       "f\\left(t\\right)=\\sin t",
//       "g\\left(a,b\\right)=a^2-b^2",
//       "f\\left(g\\left(x,y\\right)\\right)<0.5"
//     ],
//     center: [0, 0],
//     radius: 3,
//   },
// ];

export const galleryData: Graph2DGalleryItem[] = [
  // 単純な円
  {
    expressions: ["x^2+y^2<1"],
    center: [0, 0],
    radius: 2,
  },
  // 楕円
  {
    expressions: ["\\frac{x^2}{4}+y^2<1"],
    center: [0, 0],
    radius: 3,
  },
  // 双曲線
  {
    expressions: ["x^2-y^2<1"],
    center: [0, 0],
    radius: 3,
  },
  // 放物線領域
  {
    expressions: ["y<x^2"],
    center: [0, 0],
    radius: 3,
  },
  // 三角関数
  {
    expressions: ["y<\\sin x"],
    center: [0, 0],
    radius: 5,
  },
  // 関数定義を使用
  {
    expressions: ["f\\left(t\\right)=t^2", "f\\left(x\\right)+f\\left(y\\right)<1"],
    center: [0, 0],
    radius: 2,
  },
  // 複数引数関数
  {
    expressions: ["g\\left(a,b\\right)=a^2+b^2", "g\\left(x,y\\right)<1"],
    center: [0, 0],
    radius: 2,
  },
  // 複数関数の組み合わせ
  {
    expressions: [
      "f\\left(t\\right)=\\sin t",
      "g\\left(a,b\\right)=a^2-b^2",
      "f\\left(g\\left(x,y\\right)\\right)<0.5",
    ],
    center: [0, 0],
    radius: 3,
  },
];
