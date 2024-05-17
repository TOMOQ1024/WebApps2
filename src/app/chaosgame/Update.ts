import CCore from "./ChaosCore";

export default function Update (this: CCore) {
  if (this.isCvsResized) {
    const wrapper = this.cvs!.parentElement!;
    const rect = wrapper.getBoundingClientRect();
    this.cvs!.width = rect.width * this.resFactor;
    this.cvs!.height = rect.height * this.resFactor;
    this.glmgr.updateResolutionUniform();
    this.isCvsResized = false;
  }

  let r = Math.random();

  for (let i=0; i<this.seeds.length; i++) {
    const s = this.seeds[i];
    if ((r-=s.p) < 0) {
      this.p = s.mat.multedByV3(this.p);
      break;
    }
  }
}