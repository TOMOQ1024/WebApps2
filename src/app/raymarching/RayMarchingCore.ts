import { RenderingMode } from "./Definitions";
import GLMgr from "./GLMgr";
import MouseMgr from "./Mouse";
import TouchMgr from "./Touch";

export default class CDCore {
  mMgr = new MouseMgr();
  tMgr = new TouchMgr();
  glmgr = new GLMgr(this);
  iter: number = 100;
  func: string = 'z = csq(z) - vec2(.6, .42);';
  resFactor: number = 1;
  renderingMode: RenderingMode = RenderingMode.HSV;

  async init() {
    await this.glmgr.init();
    this.glmgr.updateGraphUniform();
    this.resizeCanvas();
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