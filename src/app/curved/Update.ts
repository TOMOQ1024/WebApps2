import CCore from "./CurvedCore";
import Pol2 from "./Pol2";

export default function Update(this: CCore) {
  // キーの処理
  for(let key in this.keys){
    if(this.keys[key] === 2){
      this.keys[key] = 1;
    }
  }
  let isCameraUpdated = false;
  if(this.keys.w) {
    isCameraUpdated = true;
    this.cameraPos = Pol2.dif(
      this.cameraPos,
      new Pol2(this, 0.01, this.cameraPos.b),
    );
  }
  if(this.keys.s) {
    isCameraUpdated = true;
    this.cameraPos = Pol2.sum(
      this.cameraPos,
      new Pol2(this, 0.01, this.cameraPos.b),
    );
  }
  if(this.keys.a) {
    isCameraUpdated = true;
    this.cameraPos.b += .01;
  }
  if(this.keys.d) {
    isCameraUpdated = true;
    this.cameraPos.b -= .01;
  }
  if(isCameraUpdated) {
    this.glmgr.updateCameraPositionUniform();
    console.log(Pol2.sum(this.cameraPos, Pol2.sum(this.objs[0].modelPos, new Pol2(this))));
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
