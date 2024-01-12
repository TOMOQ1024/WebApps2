import GLMgr from "./GLMgr";
import MouseMgr from "./Mouse";
import { CObj, CSquare } from "./Object";
import Pol2 from "./Pol2";
import TouchMgr from "./Touch";
import Update from "./Update";

export default class CCore {
  mMgr = new MouseMgr();
  tMgr = new TouchMgr();
  glmgr = new GLMgr(this);
  resFactor = 1;
  curvature = 1;
  keys: {[Key:string]: number} = {};
  cvsResized = true;
  ctrlAllowed = false;
  update = Update;
  interval: NodeJS.Timer|null = null;
  objs: CObj[] = [
    new CSquare(this, .5, 20),
  ];

  async init() {
    await this.glmgr.init();
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