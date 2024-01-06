import CCore from "./CurvedCore";

export default function Update(this: CCore) {
  // キーの処理
  for(let key in this.keys){
    if(this.keys[key] === 2){
      this.keys[key] = 1;
    }
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
