import GLMgr from "./GLMgr";
import Graph from "./Graph";
import Mouse from "./Mouse";

export default class CDCore {
  mouse = new Mouse();
  graph = new Graph();
  glmgr = new GLMgr(this);
  iter: number = 100;
  func: string = 'z = csq(z) - vec2(.6, .42);';

  async init() {
    await this.glmgr.init();
    this.glmgr.updateResolutionUniform();
    this.glmgr.updateGraphUniform();
    this.glmgr.render();
  }
}