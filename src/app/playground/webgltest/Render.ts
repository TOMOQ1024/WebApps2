import GLMgr from "./Core";
import Mat4 from "./Matrix";

export default function Render (this: GLMgr) {
  this.gl.clearColor (0.8, 0.9, 1.0, 1.0);
  this.gl.clearDepth (1.0);
  this.gl.clear (this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

  this.gl.viewport(0, 0, this.cvs.width, this.cvs.height);

  // 頂点属性を有効化する
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
  let positionAddress = this.gl.getAttribLocation(this.program, "position");
  this.gl.enableVertexAttribArray(positionAddress);
  this.gl.vertexAttribPointer(positionAddress, 3, this.gl.FLOAT, false, 0, 0);

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
  let colorAddress = this.gl.getAttribLocation(this.program, "color");
  this.gl.enableVertexAttribArray(colorAddress);
  this.gl.vertexAttribPointer(colorAddress, 4, this.gl.FLOAT, false, 0, 0);
  
  //描画
  this.gl.drawElements(this.gl.TRIANGLES, this.index.length, this.gl.UNSIGNED_BYTE, 0);
  // this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 3);

  // コンテキストの再描画
  this.gl.flush();
}