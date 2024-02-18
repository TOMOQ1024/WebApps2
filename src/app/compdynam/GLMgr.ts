import Render from "./Render";
import CDCore from "./CompDynamCore";
import GLMgrBase from "@/src/WebGL/GLMgrBase";
import Obj from "@/src/objects/Object";
import CreateShaders from "./CreateShaders";

export default class GLMgr extends GLMgrBase {
  render = Render;

  constructor (public parent: CDCore) {
    super({
      createShaders: CreateShaders
    });
   }
  
  async init () {
    await super._init('compdynam');

    let o = new Obj(2);
    o.position = [
      -1, -1,
      -1, +3,
      +3, -1
    ];
    o.index = [0, 2, 1];

    super.pushVAO(o);

    super.addUniform('uResolution');
    super.addUniform('uGraph.origin');
    super.addUniform('uGraph.radius');
  }

  updateGraphUniform() {
    super.setUniform2FV(
      'uGraph.origin',
      this.parent.graph.origin
    );
    super.setUniform1F(
      'uGraph.radius',
      this.parent.graph.radius
    );
  }

  updateResolutionUniform() {
    super.setUniform2F(
      'uResolution',
      this.cvs!.width,
      this.cvs!.height
    );
  }
}