import type { Tag } from "@/lib/supabase/types";

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

/**
 * タグ情報を含む Graph 2D ギャラリーアイテム
 */
export interface Graph2DGalleryItemWithTags extends Graph2DGalleryItem {
  id: string;
  tags: Tag[];
  created_by?: string | null; // auth.users の UUID
  creator_username?: string | null; // 作成者のユーザー名
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
  // empty
  {
    expressions: [],
    center: [0, 0],
    radius: 2,
  },
  // tomoq
  {
    //tags: ["closed", "alphabet", "letter"]
    expressions: [
      "1>\\min\\left(\\ \\frac{\\left|\\left(\\left|x\\right|-\\left|x-18\\right|-x+6\\right)^2+y^2-17\\right|}{8},\\max\\left(-\\frac{y}{5},\\frac{1}{4}\\left|\\left(\\left|x\\right|-2\\right)^2+\\max\\left(0,y-2\\right)^2-5\\right|\\right),\\max\\left(\\left|\\min\\left(\\frac{x+24}{5},\\frac{y+4}{4}\\right)\\right|,\\left|\\max\\left(x-28,y-4\\right)\\right|\\right),\\frac{\\max\\left(y,x+27,\\left|\\min\\left(0,x+20\\right)^2+\\min\\left(0,y\\right)^2-17\\right|\\right)}{8}\\right)",
    ],
    center: [0, 0],
    radius: 30,
  },
  // Swirl Candy
  {
    //tags: ["fractal", "closed", "circle"],
    expressions: [
      "0<\\cos\\left(6\\sin\\left(\\artanh\\left(\\sqrt{x^2+y^2}\\right)\\right)-8\\arctan\\left(y,x\\right)\\right)",
    ],
    center: [0, 0],
    radius: 1.3,
  },
  // あみあみ正方形
  {
    //tags: ["fractal", "closed", "square"],
    expressions: [
      "\\cos \\left(5\\ln \\left(\\frac{1+x}{1-x}\\right)\\right)>\\cos \\left(5\\ln \\left(\\frac{1+y}{1-y}\\right)\\right)",
    ],
    center: [0, 0],
    radius: 1.4,
  },
  // Square - Line
  {
    //tags: ["closed", "square", "sharp"],
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
  // Star
  {
    expressions: ["1>x^6+y^6+3x^4y^2+3x^2y^4-5x^4y+10x^2y^3-y^5"],
    center: [0, 0],
    radius: 1.5,
  },
  // なまこ壁
  {
    expressions: [
      "1<2\\left|\\left|\\arcsin\\sin x\\right|-\\left|\\arcsin\\sin y\\right|\\right|",
    ],
    center: [0, 0],
    radius: 5,
  },
  // ><>
  {
    expressions: [
      "1>\\max\\left(\\frac{\\left|y\\right|}{7},\\left|\\frac{\\left|3y\\right|}{2}+\\left|x-7\\right|+x-\\left|x+7\\right|-5\\right|\\right)",
    ],
    center: [0, 0],
    radius: 24,
  },
  // Rotating Record
  {
    expressions: [
      "8.8>\\left|\\left|\\left|\\left(x+y\\right)^2+\\frac{y-x}{\\cos t}^2-.4\\right|-.4\\right|-9\\right|",
    ],
    center: [0, 0],
    radius: 3.4,
  },
  // www
  {
    expressions: [
      "1>\\max\\left(\\left|2\\left|3\\left|\\left|\\left|x\\right|-1\\right|-1\\right|-1\\right|-1-y\\right|,\\left|y\\right|\\right)",
    ],
    center: [0, 0],
    radius: 3.8,
  },
  // Clover Pattern
  {
    expressions: [
      "X=\\left|\\left|x-3\\operatorname{round}\\left(\\frac{x}{3}\\right)\\right|+\\left|y-3\\operatorname{round}\\left(\\frac{y}{3}\\right)\\right|\\right|",
      "Y=\\left|\\left|x-3\\operatorname{round}\\left(\\frac{x}{3}\\right)\\right|-\\left|y-3\\operatorname{round}\\left(\\frac{y}{3}\\right)\\right|\\right|",
      ".9>\\left|\\left(X-Y-1\\right)^2+\\max\\left(0,X+Y-2\\right)^2\\right|",
    ],
    center: [0, 0],
    radius: 1.5,
  },
  {
    //tags: ["waves", "pattern", "rounded"],
    expressions: [
      "0<\\sin\\left(9\\left(x+\\arctan\\left(5\\tan\\left(\\sin y\\right)\\right)\\right)\\right)",
    ],
    center: [0, 0],
    radius: 4,
  },
  {
    //tags: ["waves", "pattern", "rounded"],
    expressions: [
      "0<\\sin\\left(9\\left(x+\\arctan\\left(2\\tan\\left(\\sin\\left(y-\\sin x\\right)\\right)\\right)\\right)\\right)",
    ],
    center: [0, 0],
    radius: 4,
  },
  {
    //tags: ["waves", "pattern", "creepy", "rounded"],
    expressions: ["0<\\sin\\left(x+4\\sin x+4\\sin y\\right)"],
    center: [0, 0],
    radius: 7,
  },
  {
    //tags: ["waves", "pattern", "sharp"],
    expressions: ["\\sin4x<\\sin\\left(y-3\\cos x\\right)"],
    center: [0, 0],
    radius: 7,
  },
  {
    //tags: ["waves", "pattern", "rounded"],
    expressions: ["\\sin6x+\\sin2x<\\sin\\left(x+5y\\right)"],
    center: [0, 0],
    radius: 3,
  },
  {
    //tags: ["waves", "pattern", "rounded"],
    expressions: ["\\sin\\left(x-\\sin2y\\right)<\\sin y"],
    center: [0, 0],
    radius: 7,
  },
  {
    //tags: ["spiral"],
    expressions: [
      "0>\\sin\\left(\\sqrt{x^2+y^2}+9\\arctan\\left(y,x\\right)\\right)",
    ],
    center: [0, 0],
    radius: 23,
  },
  {
    //tags: ["spiral", "flower"],
    expressions: [
      "\\sin\\left(\\sqrt{x^2+y^2}\\right)>\\sin\\left(7\\arctan\\left(y,x\\right)\\right)",
    ],
    center: [0, 0],
    radius: 16,
  },
  {
    //tags: ["spiral"],
    expressions: [
      "\\cos\\left(\\sqrt{x^2+y^2}-3\\arctan\\left(y,x\\right)\\right)>\\sin\\left(3\\arctan\\left(y,x\\right)\\right)",
    ],
    center: [0, 0],
    radius: 15,
  },
  {
    //tags: ["pattern"],
    expressions: [
      "0>\\sin\\left(.5\\pi x-\\pi\\operatorname{round}\\left(y-\\cos\\pi x\\right)\\right)",
    ],
    center: [0, 0],
    radius: 2,
  },
  {
    //tags: ["pattern", "sharp"],
    expressions: ["0>\\sin\\left(y-\\arcsin\\left(\\sin x\\right)\\right)"],
    center: [0, 0],
    radius: 7,
  },
  {
    //tags: ["pattern", "sharp"],
    expressions: [
      "0>\\frac{\\sin\\left(y-\\arcsin\\left(\\sin x\\right)\\right)}{\\cos\\left(x+y\\right)}",
    ],
    center: [0, 0],
    radius: 7,
  },
  {
    //tags: ["pattern", "sharp", "triangle"],
    expressions: [
      "0>\\sin\\left(y-\\arcsin\\left(\\sin2x\\right)\\right)\\cos y",
    ],
    center: [0, 0],
    radius: 8,
  },
  {
    //tags: ["pattern", "sharp", "arrow"],
    expressions: [
      "X=x-\\operatorname{round}\\left(x\\right)",
      "Y=y-2\\operatorname{round}\\left(\\frac{y}{2}\\right)",
      "8\\left|X\\right|<\\operatorname{sgn}Y-4\\max\\left(Y,0\\right)+8\\operatorname{sgn}\\left(Y+1\\right)-5",
    ],
    center: [0, 0],
    radius: 2,
  },
  {
    //tags: ["pattern", "sharp", "arrow"],
    expressions: [
      "\\sin2x<\\cos\\left(\\operatorname{mod}\\left(y,\\pi\\right)\\right)\\operatorname{floor}\\left(.5\\sin y+1\\right)",
    ],
    center: [0, 0],
    radius: 10,
  },
  {
    //tags: ["creepy", "concentric"],
    expressions: [
      "\\sin\\left(\\sqrt{x^2+y^2}\\right)<\\left|\\cos x\\right|\\left|\\cos y\\right|",
    ],
    center: [0, 0],
    radius: 15,
  },
  {
    //tags: ["concentric", "binary"],
    expressions: [
      "0>\\sin\\left(2^{\\operatorname{round}\\left(\\sqrt{x^2+y^2}\\right)}\\arctan\\left(y,x\\right)\\right)",
    ],
    center: [0, 0],
    radius: 6,
  },
  {
    //tags: ["concentric", "binary"],
    expressions: [
      "0>\\cos\\left(2^{\\operatorname{round}\\left(\\sqrt{x^2+y^2}\\right)}\\arctan\\left(y,x\\right)\\right)",
    ],
    center: [0, 0],
    radius: 6,
  },
  {
    //tags: ["circle", "square"],
    expressions: [
      "\\left|\\sin\\frac{x}{x^2+y^2}\\right|>\\left|\\sin\\frac{y}{x^2+y^2}\\right|",
    ],
    center: [0, 0],
    radius: 0.4,
  },
  {
    expressions: [
      "0>\\sin\\left(\\frac{x}{x^2+y^2}-\\arcsin\\left(\\sin\\left(\\frac{y}{x^2+y^2}\\right)\\right)\\right)",
    ],
    center: [0, 0],
    radius: 0.4,
  },
  {
    //tags: ["triangle"],
    expressions: [
      "X=\\frac{x}{x^2+y^2}",
      "Y=\\frac{y}{x^2+y^2}",
      "0>\\sin\\left(\\frac{Y+\\sqrt{3}X}{2}\\right)\\sin\\left(\\frac{Y-\\sqrt{3}X}{2}\\right)\\sin Y",
    ],
    center: [0, 0],
    radius: 0.35,
  },
  {
    //tags: ["circle"],
    expressions: [
      "X=\\operatorname{mod}\\left(\\frac{x}{x^2+y^2},2\\right)",
      "Y=\\operatorname{mod}\\left(\\frac{y}{x^2+y^2},2\\right)",
      "1>\\left(X-1\\right)^2+\\left(Y-1\\right)^2",
    ],
    center: [0, 0],
    radius: 0.35,
  },
];
