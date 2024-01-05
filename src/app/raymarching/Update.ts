import RMCore from "./RayMarchingCore";

export default function Update(this: RMCore) {
  // キーの処理
  for(let key in this.keys){
    if(this.keys[key] === 2){
      this.keys[key] = 1;
    }
  }
  if(this.ctrlAllowed && !this.keys.meta){
    // カメラの移動
    if(this.keys.a) this.camera.move('leftward', 1);
    if(this.keys.d) this.camera.move('rightward', 1);
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
    const wrapper = this.glmgr.cvs!.parentElement!;
    const rect = wrapper.getBoundingClientRect();
    this.glmgr.cvs!.width = rect.width * this.resFactor;
    this.glmgr.cvs!.height = rect.height * this.resFactor;
    this.glmgr.updateResolutionUniform();
    this.cvsResized = false;
  }
}
