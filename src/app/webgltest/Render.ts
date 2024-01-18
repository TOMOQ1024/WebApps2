import GLMgr from "./GLMgr";

export default function Render (this: GLMgr) {
  this.gl!.clearColor (0.8, 0.9, 1.0, 1.0);
  this.gl!.clearDepth (1.0);
  this.gl!.clear (this.gl!.COLOR_BUFFER_BIT | this.gl!.DEPTH_BUFFER_BIT);
  this.gl!.viewport(0, 0, this.gl!.canvas.width, this.gl!.canvas.height);

  for(let i=0; i<this.VAOs.length; i++){
    this.vao_ext!.bindVertexArrayOES(this.VAOs[i]);
    this.object = this.objects[i];
    
    // モデル変換と描画
    this.gl!.uniformMatrix4fv(this.uniLoc.miMat, false, this.object.mdlMat.inversed().elem);
    this.gl!.uniformMatrix4fv(this.uniLoc.mMat, false, this.object.mdlMat.elem);
    this.gl!.drawElements(this.gl!.TRIANGLES, this.index.length, this.gl!.UNSIGNED_INT, 0);
    // this.gl!.drawElements(this.gl!.POINTS, this.index.length, this.gl!.UNSIGNED_INT, 0);
    // this.gl!.drawElements(this.gl!.LINES, this.index.length, this.gl!.UNSIGNED_INT, 0);
  }



  // コンテキストの再描画
  this.gl!.flush();
}
