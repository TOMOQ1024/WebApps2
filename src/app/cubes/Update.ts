import Mat4 from "@/src/Mat4";
import Vec3 from "@/src/Vec3";
import CCore from "./CubesCore";

let iii = 0;

export default function Update(this: CCore) {
  iii++;
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

    // てんぽらり！
    if(this.keys.p) this.cbmgr.rotate(0, .01);
    if(this.keys.o) this.cbmgr.rotate(0, -.01);
    if(this.keys.l) this.cbmgr.rotate(1, .01);
    if(this.keys.k) this.cbmgr.rotate(1, -.01);
    if(this.keys[',']) this.cbmgr.rotate(3, .01);
    if(this.keys.m) this.cbmgr.rotate(3, -.01);
    if(this.keys.j) this.cbmgr.normalize();
    if(iii%5 === 0){
    }
  }

  // キャンバスのリサイズ!!!
  if(this.cvsResized){
    const wrapper = this.glmgr.cvs!.parentElement!;
    const rect = wrapper.getBoundingClientRect();
    this.glmgr.cvs!.width = rect.width * this.resFactor;
    this.glmgr.cvs!.height = rect.height * this.resFactor;
    this.glmgr.gl!.uniform2f(
      this.glmgr.uniLoc.res,
      this.glmgr.cvs!.width,
      this.glmgr.cvs!.height
    );
    this.pMatrix = Mat4.pMatrix(90 * Math.PI / 180, this.glmgr.cvs!.width / this.glmgr.cvs!.height, 0.1, 100);
    this.glmgr.gl!.uniformMatrix4fv(this.glmgr.uniLoc.pMat, false, this.pMatrix.elem);
    this.cvsResized = false;
  }
  
  // 行列の更新
  if(this.matUpdated){
    this.vMatrix = Mat4.vMatrix(this.camera.position, this.camera.forward, this.camera.up);
    this.glmgr.gl!.uniformMatrix4fv(this.glmgr.uniLoc.vMat, false, this.vMatrix.elem);
    this.matUpdated = false;
  }

  // モデル変換行列の更新
  // this.objects[0].mdlMat.rotate(new Vec3(1, 1, 1), .01);
  // this.objs[0].mdlMat.rotate(new Vec3(1, 1, 1), -.01);
}
