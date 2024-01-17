import Cube from "@/src/objects/Cube";
import Obj from "@/src/objects/Object";
import Camera from "./Camera";
import GLMgr from "./GLMgr";
import MouseMgr from "./Mouse";
import TouchMgr from "./Touch";
import Update from "./Update";

export default class CCore {
  mMgr = new MouseMgr();
  tMgr = new TouchMgr();
  glmgr = new GLMgr(this);
  resFactor = 1;
  keys: {[Key:string]: number} = {};
  cvsResized = true;
  ctrlAllowed = false;
  matUpdated = true;
  update = Update;
  interval: NodeJS.Timer|null = null;
  objs: Obj[] = [
    new Cube(),
  ];
  camera = new Camera(this);

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