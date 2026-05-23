import Camera from "./Camera";
import GLMgr from "./GLMgr";
import Update from "./Update";

export default class Core {
  glmgr = new GLMgr(this);
  resFactor = 1;
  camera = new Camera(this);
  keys: {[Key:string]: number} = {};
  cvsResized = true;
  ctrlAllowed = false;
  update = Update;
  interval: NodeJS.Timeout|null = null;

  async init() {
    await this.glmgr.init();
    // this.glmgr.updateCameraUniform();
    this.glmgr.matUpdated = true;
    this.beginLoop();
    this.ctrlAllowed = true;
  }

  loop(self: Core) {
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