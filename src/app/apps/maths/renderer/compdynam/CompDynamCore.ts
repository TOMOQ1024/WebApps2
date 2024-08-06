import { Parse } from "@/src/parser/Main";
import { RenderingMode } from "./Definitions";
import GLMgr from "./GLMgr";
import GraphMgr from "@/src/GraphMgr";
import { Dispatch, SetStateAction } from "react";

export default class CDCore {
  pointers: {
    pointerId: number;
    clientX: number;
    clientY: number;
  }[] = [];
  graph = new GraphMgr();
  glmgr = new GLMgr(this);
  iter: number = 100;
  _error = "";
  _setError: Dispatch<SetStateAction<string>> = () => {};
  get error() {
    return this._error;
  }
  set error(e) {
    this._setError((this._error = e));
  }
  z0: string = "c";
  _z0expr: string = "c";
  _setZ0Expr: Dispatch<SetStateAction<string>> = () => {};
  get z0expr() {
    return this._z0expr;
  }
  set z0expr(s: string) {
    const result = Parse(s, ["i", "c", "t"], "expr");
    let z0 = "";
    if (result.status) {
      try {
        z0 = result.root!.tocdgl();
      } catch (e) {
        this.error = `${e}`;
        console.error(e);
        return;
      }
      this.error = "";
      this.z0 = z0;
      this._z0expr = s; // this line will be deleted
      this._setZ0Expr(s);
      this.init();
    } else {
      this.error = "parse failed";
    }
  }
  func: string = "z = csq(z) - vec2(.6, .42);";
  _funcexpr: string = "z^2-0.6-0.42i";
  _setFuncexpr: Dispatch<SetStateAction<string>> = () => {};
  get funcexpr() {
    return this._funcexpr;
  }
  set funcexpr(s: string) {
    const result = Parse(s, ["z", "i", "c", "t"], "expr");
    let f = "";
    if (result.status) {
      try {
        f = result.root!.tocdgl();
      } catch (e) {
        this.error = `${e}`;
        console.error(e);
        return;
      }
      this.error = "";
      this.func = f;
      this._funcexpr = s; // this line will be deleted
      this._setFuncexpr(s);
      this.init();
    } else {
      this.error = "parse failed";
    }
  }
  resFactor: number = 1;
  renderingMode: RenderingMode = RenderingMode.HSV;
  nessyMode = false;
  interval: NodeJS.Timeout | null = null;
  controls = true;

  async init() {
    await this.glmgr.init();
    this.glmgr.updateGraphUniform();
    this.resizeCanvas();
  }

  beginLoop() {
    this.interval = setInterval(() => {
      this.loop();
    }, 50);
  }

  endLoop() {
    if (!this.interval) return;
    clearInterval(this.interval);
  }

  loop() {
    this.glmgr.updateTimeUniform();
    this.glmgr.render();
  }

  setIter(i: number) {
    this.iter = i;
  }

  setRF(x: number) {
    this.resFactor = x;
  }

  setRM(m: RenderingMode) {
    this.renderingMode = m;
  }

  resizeCanvas() {
    const wrapper = this.glmgr.cvs!.parentElement!;
    const rect = wrapper.getBoundingClientRect();
    this.glmgr.updateResolutionUniform();
    this.glmgr.cvs!.width = rect.width * this.resFactor;
    this.glmgr.cvs!.height = rect.height * this.resFactor;
    this.glmgr.updateResolutionUniform();
    this.glmgr.render();
  }
}
