import CCore from "./ChaosCore";

export default function Update (this: CCore) {
  let r = Math.random();

  for (let i=0; i<this.seeds.length; i++) {
    const s = this.seeds[i];
    if ((r-=s.p) < 0) {
      this.p = s.mat.multedByV3(this.p);
      break;
    }
  }
}