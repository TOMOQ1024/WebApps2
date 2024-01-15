import GLMgr from "./GLMgr";
import MouseMgr from "./Mouse";
import { CObj, CSquare } from "./Object";
import Pol2 from "./Pol2";
import TouchMgr from "./Touch";
import Update from "./Update";

export default class CCore {
  _curvature = 1;
  get curvature(){
    return this._curvature;
  }
  set curvature(c: number) {
    this._curvature = c;
    this.glmgr.updateCurvatureUniform();
  }
  mMgr = new MouseMgr();
  tMgr = new TouchMgr();
  glmgr = new GLMgr(this);
  resFactor = 1;
  keys: {[Key:string]: number} = {};
  cvsResized = true;
  ctrlAllowed = false;
  update = Update;
  interval: NodeJS.Timer|null = null;
  objs: CObj[] = [
    new CSquare(this, .5, 5),
  ];
  cameraPos = new Pol2(this);

  async init() {
    await this.glmgr.init();
    this.glmgr.updateResolutionUniform();
    this.glmgr.updateCurvatureUniform();
    this.glmgr.updateCameraPositionUniform();
    this.glmgr.updateModelPositionUniform(this.objs[0].modelPos);
    this.beginLoop();
    this.ctrlAllowed = true;
  }

  loop(self: CCore) {
    self.update();
    self.glmgr.render();
  }

  beginLoop() {
    const self = this;
    self.interval = setInterval(()=>this.loop(self), 1000/60);
  }

  endLoop() {
    if(!this.interval)return;
    clearInterval(this.interval);
  }

  setRF(x: number) {
    this.resFactor = x;
  }
}