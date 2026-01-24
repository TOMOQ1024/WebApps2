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
  // Swirl Candy
  {
    expressions: [
      "0<\\cos\\left(6\\sin\\left(\\artanh\\left(\\sqrt{x^2+y^2}\\right)\\right)-8\\arctan\\left(y,x\\right)\\right)",
    ],
    center: [0, 0],
    radius: 1.1,
  },
  // あみあみ正方形
  {
    expressions: [
      "\\cos \\left(5\\ln \\left(\\frac{1+x}{1-x}\\right)\\right)>\\cos \\left(5\\ln \\left(\\frac{1+y}{1-y}\\right)\\right)",
    ],
    center: [0, 0],
    radius: 1.1,
  },
  // 双曲線
  {
    expressions: ["x^2-y^2<1"],
    center: [0, 0],
    radius: 3,
  },
];
