import GLMgr from "./GLMgr";

export default function Render (this: GLMgr) {
  this.gl.clearColor (0.8, 0.9, 1.0, 1.0);
  this.gl.clearDepth (1.0);
  this.gl.clear (this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

  this.vao_ext!.bindVertexArrayOES(this.vao);
  
  // モデル変換と描画
  this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_INT, 0);
  
  // コンテキストの再描画
  this.gl.flush();
}
