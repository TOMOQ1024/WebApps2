import CCore from "./ChaosCore";

export default function Render (this: CCore) {
  this.ctx!.beginPath();
  this.ctx!.arc(this.p.x*40, this.p.y*40, .5, 0, Math.PI*2);
  this.ctx!.fill();
}