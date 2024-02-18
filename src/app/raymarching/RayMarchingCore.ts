import Camera from "./Camera";
import GLMgr from "./GLMgr";
import MouseMgr from "./Mouse";
import TouchMgr from "./Touch";
import Update from "./Update";

export default class RMCore {
  mMgr = new MouseMgr();
  tMgr = new TouchMgr();
  glmgr = new GLMgr(this);
  resFactor = .4;
  camera = new Camera(this);
  keys: {[Key:string]: number} = {};
  cvsResized = true;
  ctrlAllowed = false;
  update = Update;
  interval: NodeJS.Timer|null = null;

  async init() {
    await this.glmgr.init();
    this.glmgr.updateCameraUniform();
    this.beginLoop();
    this.ctrlAllowed = true;
  }

  loop(self: RMCore) {
    self.update();
    self.glmgr.render();
  }

  beginLoop() {
    const self = this;
    self.interval = setInterval(()=>this.loop(self), 1000/60);
  }

  endLoop() {
    if(!this.interval){
      return;
    }
    clearInterval(this.interval);
  }

  setRF(x: number) {
    this.resFactor = x;
  }
}