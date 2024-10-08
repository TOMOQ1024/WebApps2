import Mouse from "@/src/Mouse";

export default class Game {
  player: 0 | 1 = 0;
  scene: "title" | "game" | "result" = "title";
  result: string = "";
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cells: number[][] = [];
  mouse: Mouse;

  constructor(cvs: HTMLCanvasElement, w = 0, h = 0) {
    this.cvs = cvs;
    this.ctx = cvs.getContext("2d")!;
    this.mouse = new Mouse(w, h);
  }
}
