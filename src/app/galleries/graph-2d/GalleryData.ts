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
  // tomoq
  {
    expressions: [
      "1>\\min\\left(\\ \\frac{\\left|\\left(\\left|x\\right|-\\left|x-18\\right|-x+6\\right)^2+y^2-17\\right|}{8},\\max\\left(-\\frac{y}{5},\\frac{1}{4}\\left|\\left(\\left|x\\right|-2\\right)^2+\\max\\left(0,y-2\\right)^2-5\\right|\\right),\\max\\left(\\left|\\min\\left(\\frac{x+24}{5},\\frac{y+4}{4}\\right)\\right|,\\left|\\max\\left(x-28,y-4\\right)\\right|\\right),\\frac{\\max\\left(y,x+27,\\left|\\min\\left(0,x+20\\right)^2+\\min\\left(0,y\\right)^2-17\\right|\\right)}{8}\\right)",
    ],
    center: [0, 0],
    radius: 30,
  },
  // Swirl Candy
  {
    expressions: [
      "0<\\cos\\left(6\\sin\\left(\\artanh\\left(\\sqrt{x^2+y^2}\\right)\\right)-8\\arctan\\left(y,x\\right)\\right)",
    ],
    center: [0, 0],
    radius: 1.3,
  },
  // あみあみ正方形
  {
    expressions: [
      "\\cos \\left(5\\ln \\left(\\frac{1+x}{1-x}\\right)\\right)>\\cos \\left(5\\ln \\left(\\frac{1+y}{1-y}\\right)\\right)",
    ],
    center: [0, 0],
    radius: 1.4,
  },
  // Square - Line
  {
    expressions: [
      "0>\\max \\left(\\left|\\left|x\\right|+\\left|y\\right|-7\\right|-3,1-\\left|x\\right|\\right)",
    ],
    center: [0, 0],
    radius: 13,
  },
  // Currency sign (generic)
  {
    expressions: [
      "1>\\min \\left(\\frac{\\left|x^2+y^2-9\\right|}{3\\sqrt{2}},\\max \\left(\\left|\\left|x\\right|+\\left|y\\right|-6\\right|,\\left|\\left|x\\right|-\\left|y\\right|\\right|\\right)\\right)",
    ],
    center: [0, 0],
    radius: 6,
  },
  // Flower
  {
    expressions: [
      "\\left|x\\right|+\\left|y\\right|>\\frac{\\left|xy\\right|}{6}+\\left|\\left|x\\right|-9\\right|+\\left|\\left|y\\right|-9\\right|+1",
    ],
    center: [0, 0],
    radius: 16,
  },
  // Code
  {
    expressions: [
      "1>\\min \\left(\\max \\left(\\frac{\\left|\\left|x\\right|-5\\right|}{2},\\left|\\left|x\\right|+2\\left|y\\right|-7\\right|\\right),\\max \\left(\\left|2x-y\\right|,\\frac{\\left|y\\right|}{4}\\right)\\right)",
    ],
    center: [0, 0],
    radius: 8,
  },
  // Checkerboard
  {
    expressions: [
      "0>\\frac{\\max \\left(\\frac{\\left|x\\right|}{4},\\left|\\left|y-1\\right|-2\\right|\\right)-1}{\\max \\left(\\left|\\left|x-1\\right|-2\\right|,\\frac{\\left|y\\right|}{4}\\right)-1}",
    ],
    center: [0, 0],
    radius: 6,
  },
  // 7 rounded wave
  {
    expressions: [
      "X\\left(x,y\\right)=\\sin \\left(\\frac{7}{2}\\arctan \\left(x,y\\right)\\right)",
      "Y\\left(x,y\\right)=\\ln \\left(x^2+y^2\\right)",
      "1>X\\left(x,y\\right)^2+4Y\\left(x,y\\right)^2",
    ],
    center: [0, 0],
    radius: 1.7,
  },
  // Star Polygons
  {
    expressions: [
      "n=\\operatorname{round}\\left(7+2\\sin t\\right)",
      "1>9\\left|\\sqrt{xx+yy}\\left(\\sin \\left(\\frac{\\left(n-3\\right)\\pi -2\\arcsin \\left(\\cos \\left(n\\arctan \\left(x,y\\right)\\right)\\right)}{2n}\\right)\\right)+\\sin \\left(\\frac{4-n}{2n}\\pi \\right)\\right|",
    ],
    center: [0, 0],
    radius: 1.4,
  },
  // Stairs
  {
    expressions: ["\\lfloor x\\rfloor <y<\\lceil x\\rceil "],
    center: [0, 0],
    radius: 3,
  },
  // Pixelated Gradient
  {
    expressions: [
      "\\frac{\\lfloor x\\rfloor }{5}-\\frac{\\lfloor y\\rfloor }{5}",
    ],
    center: [0, 0],
    radius: 5,
  },
  // Rotating Two Circles
  {
    expressions: [
      "x\\left(x^2+y^2-1\\right)\\cos t>\\left(x^4+y^4+2x^2y^2-6x^2-2y^2+1\\right)\\sin t",
    ],
    center: [0, 0],
    radius: 3,
  },
  // Ovals
  {
    expressions: ["\\left|xy\\right|>\\left|x^2+y^2-1\\right|"],
    center: [0, 0],
    radius: 1.7,
  },
  // Four Circles
  {
    expressions: [
      "\\left|\\left|x\\right|-\\left|y\\right|\\right|>\\left|x^2+y^2-\\left|x\\right|-\\left|y\\right|\\right|",
    ],
    center: [0, 0],
    radius: 2.5,
  },
  // Flower
  {
    expressions: [
      "\\left|\\left|x\\right|-\\left|y\\right|\\right|>x^2+y^2-\\left|xy\\right|",
    ],
    center: [0, 0],
    radius: 1.2,
  },
  // Clover
  {
    expressions: [
      "\\sqrt{\\left|\\left|x\\right|-\\left|y\\right|\\right|}>x^2+y^2-\\left|xy\\right|",
    ],
    center: [0, 0],
    radius: 1.4,
  },
];
