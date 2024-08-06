import Render from "./Render";
import CDCore from "./CompDynamCore";
import GLMgrBase from "@/src/WebGL/GLMgrBase";
import Obj from "@/src/objects/Object";
import CreateShaders from "./CreateShaders";
import loadImage from "./Image";

export default class GLMgr extends GLMgrBase {
  render = Render;

  constructor(public parent: CDCore) {
    super({
      createShaders: CreateShaders,
    });
  }

  async init() {
    await super._init("compdynam");

    let o = new Obj(2);
    o.position = [-1, -1, -1, +3, +3, -1];
    o.index = [0, 2, 1];

    super.pushVAO(o);

    super.addUniform("uResolution");
    super.addUniform("uGraph.origin");
    super.addUniform("uGraph.radius");
    super.addUniform("uTime");

    let img0 = await loadImage("/resources/compdynam/images/nessy.png");
    let tex0 = this.gl!.createTexture();
    this.gl!.bindTexture(this.gl!.TEXTURE_2D, tex0);
    this.gl!.texParameteri(
      this.gl!.TEXTURE_2D,
      this.gl!.TEXTURE_MAG_FILTER,
      this.gl!.NEAREST
    );
    this.gl!.texParameteri(
      this.gl!.TEXTURE_2D,
      this.gl!.TEXTURE_MIN_FILTER,
      this.gl!.NEAREST
    );
    this.gl!.texImage2D(
      this.gl!.TEXTURE_2D,
      0,
      this.gl!.RGBA,
      this.gl!.RGBA,
      this.gl!.UNSIGNED_BYTE,
      img0
    );
    this.gl!.generateMipmap(this.gl!.TEXTURE_2D);
    this.gl!.bindTexture(this.gl!.TEXTURE_2D, null);
    this.uniLoc.tex0 = this.gl!.getUniformLocation(this.program!, "uImage0");
    this.gl!.activeTexture(this.gl!.TEXTURE0);
    this.gl!.bindTexture(this.gl!.TEXTURE_2D, tex0);
    this.gl!.uniform1i(this.uniLoc.tex0, 0);
  }

  updateGraphUniform() {
    super.setUniform2FV("uGraph.origin", this.parent.graph.origin);
    super.setUniform1F("uGraph.radius", this.parent.graph.radius);
  }

  updateResolutionUniform() {
    super.setUniform2F("uResolution", this.cvs!.width, this.cvs!.height);
  }

  updateTimeUniform() {
    super.setUniform1F("uTime", performance.now() / 1000);
  }
}
