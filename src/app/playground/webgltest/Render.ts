import GLMgr from "./Core";
import Mat4 from "./Matrix";

export default function Render (this: GLMgr) {
  this.gl.clearColor (0.8, 0.9, 1.0, 1.0);
  this.gl.clearDepth (1.0);
  this.gl.clear (this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

  // モデル変換と描画
  const mMatrix = Mat4.Identity;
  this.gl.uniformMatrix4fv(this.mMatLoc, false, mMatrix.elem);
  this.gl.drawElements(this.gl.TRIANGLES, this.index.length, this.gl.UNSIGNED_BYTE, 0);

  // コンテキストの再描画
  this.gl.flush();
}
