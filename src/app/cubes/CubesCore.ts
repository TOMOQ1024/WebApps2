import Mat4 from "@/src/Mat4";
import Obj from "@/src/objects/Object";
import Torus from "@/src/objects/Torus";
import Camera from "./Camera";
import CubeMgr from "./CubeMgr";
import GLMgr from "./GLMgr";
import MouseMgr from "./Mouse";
import TouchMgr from "./Touch";
import Update from "./Update";
import { VBO } from "./VBO";

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
  interval: NodeJS.Timeout|null = null;
  cbmgr = new CubeMgr(this);
  vMatrix: Mat4 = Mat4.Identity;
  pMatrix: Mat4 = Mat4.Identity;
  _objs: Obj[] = [];
  get objs(): Obj[] {
    return this.cbmgr.cubes.concat(this._objs);
  }
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

  addObj (o: Obj) {
    this._objs.push(o);
    this.glmgr.VAOs.push(this.glmgr.vao_ext!.createVertexArrayOES()!);
    const i = this.glmgr.VAOs.length-1;
    this.glmgr.vao_ext!.bindVertexArrayOES(this.glmgr.VAOs[i]);

    let pVBO = new VBO(this.glmgr, 'aPosition', 3, o.position);
    pVBO.enable();
    
    let nVBO = new VBO(this.glmgr, 'aNormal', 3, o.normal);
    nVBO.enable();

    let cVBO = new VBO(this.glmgr, 'aColor', 4, o.color);
    cVBO.enable();

    let tVBO = new VBO(this.glmgr, 'aTexCoord', 2, o.texCoord);
    tVBO.enable();

    // IBO
    let indexBuffer = this.glmgr.gl!.createBuffer();
    this.glmgr.gl!.bindBuffer(this.glmgr.gl!.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.glmgr.gl!.bufferData(this.glmgr.gl!.ELEMENT_ARRAY_BUFFER, new Uint32Array(o.index), this.glmgr.gl!.STATIC_DRAW);
  }
}