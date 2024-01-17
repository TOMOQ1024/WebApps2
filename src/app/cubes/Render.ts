import GLMgr from "./GLMgr";

export default function Render (this: GLMgr) {
  this.gl!.clearColor (0.8, 0.9, 1.0, 1.0);
  this.gl!.clearDepth (1.0);
  this.gl!.clear (this.gl!.COLOR_BUFFER_BIT | this.gl!.DEPTH_BUFFER_BIT);
  this.gl!.viewport(0, 0, this.gl!.canvas.width, this.gl!.canvas.height);

  for(let i=0; i<this.parent.objs.length; i++) {
    this.vao_ext!.bindVertexArrayOES(this.VAOs[i]);
    let o = this.parent.objs[i];
    
    this.gl!.uniformMatrix4fv(this.uniLoc.miMat, false, o.mdlMat.inverse().elem);
    this.gl!.uniformMatrix4fv(this.uniLoc.mMat, false, o.mdlMat.elem);
    // 描画
    this.gl!.drawElements(this.gl!.TRIANGLES, o.index.length, this.gl!.UNSIGNED_INT, 0);
  }

  // コンテキストの再描画
  this.gl!.flush();
}
