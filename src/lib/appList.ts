export type AppTag =
  | "utility"
  | "game"
  | "maths"
  | "experimental"
  | "webgl"
  | "webgpu"
  | "fractal"
  | "geometry"
  | "wip";

/**
 * アプリのリスト
 *
 * `appName`の定義されているものが 1 つのページに対応し，そこに至るまでの階層がそのページのパスになる
 * `appName`が定義されていないものはアプリではなくページ一覧のページに対応する
 */
export const appList = {
  // (experimental)
  // matter: {
  //   appName: "Matter.js Test",
  //   tags: new Set(["wip"]),
  // },
  // p5: {
  //   appName: "p5.js Test",
  //   tags: new Set(["wip"]),
  // },
  // parser: {
  //   appName: "Parser Test",
  //   tags: new Set(["wip"]),
  // },
  // pixi: {
  //   appName: "Pixi.js Test",
  //   tags: new Set(["wip"]),
  // },
  // raymarching: {
  //   appName: "Raymarching",
  //   tags: new Set(["wip"]),
  // },
  // svg: {
  //   appName: "SVG",
  //   description: "SVGやSVG Filterの実験",
  //   tags: new Set(["wip"]),
  // },
  // "three/fiber": {
  //   appName: "React-three-fiber",
  //   tags: new Set(["wip"]),
  // },
  // "three/glb": {
  //   appName: "GLB",
  //   tags: new Set(["wip"]),
  // },
  // "three/vrm": {
  //   appName: "VRM",
  //   tags: new Set(["wip"]),
  // },
  // "webcam/facelandmark": {
  //   appName: "Webcam Face Landmark",
  //   tags: new Set(["wip"]),
  // },
  // webgltest: {
  //   appName: "WebGL Test",
  //   tags: new Set(["wip"]),
  // },
  // webgpu: {
  //   appName: "WebGPU Test",
  //   tags: new Set(["wip"]),
  // },

  // (game)
  cubes: {
    appName: "Cubes",
    tags: new Set(["game", "wip"]),
  },
  flappypigeon: {
    appName: "Flappy Pigeon",
    tags: new Set(["game", "wip"]),
  },
  minesweeper: {
    appName: "Minesweeper",
    tags: new Set(["game", "wip"]),
  },
  nessy: {
    appName: "Nessy",
    tags: new Set(["game", "wip"]),
  },
  tictactoe: {
    appName: "Tic Tac Toe",
    tags: new Set(["game", "wip"]),
  },
  othello: {
    appName: "Othello",
    tags: new Set(["game", "wip"]),
  },
  untitled: {
    appName: "Untitled",
    tags: new Set(["game", "wip"]),
  },

  chaosgame: {
    appName: "Chaos Game",
    tags: new Set(["wip"]),
  },
  compdynam: {
    appName: "CompDynam",
    tags: new Set(["maths", "fractal"]),
  },
  graph2d: {
    appName: "2D Graphing Calculator",
    tags: new Set(["maths", "wip"]),
  },
  graph3d: {
    appName: "3D Graphing Calculator",
    tags: new Set(["maths", "wip"]),
  },
  "2d-tiling": {
    appName: "2D Tiling",
    tags: new Set(["maths", "geometry"]),
  },
  h2tiling: {
    appName: "H2 Tiling",
    tags: new Set(["wip"]),
  },
  lifegame: {
    appName: "Life Game",
    tags: new Set(["wip"]),
  },
  mandelbrotset: {
    appName: "Mandelbrot Set",
    tags: new Set(["wip"]),
  },
  polychora: {
    appName: "Polychora",
    tags: new Set(["maths", "geometry"]),
  },
  polyhedra: {
    appName: "Polyhedra",
    tags: new Set(["maths", "geometry"]),
  },
  recursivetree: {
    appName: "Recursive Tree",
    tags: new Set(["wip"]),
  },
  sierpinskigasket: {
    appName: "Sierpinski Gasket",
    tags: new Set(["wip"]),
  },

  diceroll: {
    appName: "Dice Roll",
    tags: new Set(["utility", "wip"]),
  },
  glslfilter: {
    appName: "GLSL Filter",
    tags: new Set(["utility", "webgl"]),
  },
} as {
  [path: string]: {
    appName: string;
    description?: string;
    tags: Set<AppTag>;
  };
};
