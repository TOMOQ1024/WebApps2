import Mat4 from "@/src/Mat4";
import Cube from "@/src/objects/Cube";
import Obj from "@/src/objects/Object";
import Vec3 from "@/src/Vec3";
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
  objs: Obj[] = [];
  camera = new Camera(this);

  async init() {
    const B = [0., 0., 0., 1.];
    for (let z=-1; z<=1; z++) {
      for (let y=-1; y<=1; y++) {
        for (let x=-1; x<=1; x++) {
          const c = new Cube(
            new Vec3(x, y, z).scaledBy(2),
            0.9
          );
          c.color = [
            x<0 ? [1., .5, 0., 1.] : B,// -x
            0<x ? [1., 0., 0., 1.] : B,// +x
            y<0 ? [1., 1., 1., 1.] : B,// -y
            0<y ? [1., 1., 0., 1.] : B,// +y
            z<0 ? [0., .8, 0., 1.] : B,// -z
            0<z ? [0., 0., 1., 1.] : B,// +z
          ].map(v=>[v, v, v, v]).flat(2);
          this.objs.push(c);
        }
      }
    }
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