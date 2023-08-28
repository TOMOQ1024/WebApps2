import GLMgr from "./Core";

export default function Render (this: GLMgr) {
  this.gl.clearColor (0.8, 0.9, 1.0, 1.0);
  this.gl.clearDepth (1.0);
  this.gl.clear (this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

  // モデル変換と描画
  this.gl.uniformMatrix4fv(this.miMatLoc, false, this.object.mdlMat.inverse().elem);
  this.gl.uniformMatrix4fv(this.mMatLoc, false, this.object.mdlMat.elem);
  this.gl.drawElements(this.gl.TRIANGLES, this.index.length, this.gl.UNSIGNED_INT, 0);

  // コンテキストの再描画
  this.gl.flush();
}
