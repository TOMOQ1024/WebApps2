import GLMgr from "./Core";
import Mat4 from "./Matrix";
import Vec3 from "./Vector";

export default function Update(this: GLMgr) {
  // キーの処理
  for(let key in this.keys){
    if(this.keys[key] === 2){
      this.keys[key] = 1;
    }
  }
  if(this.ctrlAllowed && !this.keys.meta){
    // カメラの移動
    if(this.keys.a) this.camera.move('left', 1);
    if(this.keys.d) this.camera.move('right', 1);
    if(this.keys.w) this.camera.move('hforward', 1);
    if(this.keys.s) this.camera.move('hbackward', 1);
    if(this.keys[' ']) this.camera.move('vup', 1);
    if(this.keys.shift) this.camera.move('vdown', 1);

    // カメラの向き
    if(this.keys.arrowleft) this.camera.rotate('left', 1);
    if(this.keys.arrowright) this.camera.rotate('right', 1);
    if(this.keys.arrowup) this.camera.rotate('up', 1);
    if(this.keys.arrowdown) this.camera.rotate('down', 1);
  }

  // キャンバスのリサイズ!!!
  if(this.cvsResized){
    const pMatrix = Mat4.pMatrix(90 * Math.PI / 180, this.gl.canvas.width / this.gl.canvas.height, 0.1, 100);
    this.gl.uniformMatrix4fv(this.pMatLoc, false, pMatrix.elem);
    this.gl.uniform2f(this.resLoc, this.gl.canvas.width, this.gl.canvas.height);
  }
  
  // 行列の更新
  if(this.matUpdated){
    const vMatrix = Mat4.vMatrix(this.camera.position, this.camera.forward, this.camera.up);
    this.gl.uniformMatrix4fv(this.vMatLoc, false, vMatrix.elem);
    this.matUpdated = false;
  }

  // モデル変換行列の更新
  this.object.mdlMat.rotate(new Vec3(1, 1, 1), .01);
}

// let vpMatrix = Mat4.prod(pMatrix, vMatrix);