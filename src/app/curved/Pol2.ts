import Vec2 from "@/src/Vec2";
import CCore from "./CurvedCore";

export default class Pol2 {
  /**
   * 
   * @param parent CurvedCore
   * @param r 原点からの距離
   * @param a 原点からの角度
   * @param b 点の相対角度
   */
  constructor (
    public parent: CCore|null=null,
    public r=0,
    public a=0,
    public b=0,
  ) {}

  get k() {
    if(!this.parent)return 0;
    return 1/Math.sqrt(this.parent.curvature);
  }

  get elem() {
    return [this.r, this.a];
  }

  xy() {
    return new Vec2(
      this.r * Math.cos(this.a),
      this.r * Math.sin(this.a)
    );
  }

  static O = new Pol2();

  static neg(v: Pol2) {
    return new Pol2(
      v.parent,
      -v.r,
      v.a,
      v.b
    );
  }

  static sum(c: Pol2, v: Pol2) {
    const k = c.k || v.k;
    if(!k){
      throw new Error('failed to get curvature');
    }
    const b0 = (c.b+v.a)%(2*Math.PI);
    const b = Math.PI - Math.abs(b0-Math.PI);
    const rr = k*Math.acos(
      Math.cos(c.r/k)*Math.cos(v.r/k)+
      Math.sin(c.r/k)*Math.sin(v.r/k)*Math.cos(b)
    );
    const ra = c.a+Math.sign(b0-Math.PI)*Math.acos(
      (Math.cos(v.r/k)-Math.cos(c.r/k)*Math.cos(rr/k))/
      (Math.sin(c.r/k)*Math.sin(rr/k))
    );
    return new Pol2(c.parent, rr, ra);
  }

  static dif(c: Pol2, v: Pol2) {
    return Pol2.sum(c, Pol2.neg(v));
  }

  static dist(v1: Pol2, v2: Pol2) {
    const k = v1.k || v2.k;
    if(!k){
      throw new Error('failed to get curvature');
    }
    const d = v2.a-v1.a;
    return k*Math.acos(
      Math.cos(v1.r/k)*Math.cos(v2.r/k)+
      Math.sin(v1.r/k)*Math.sin(v2.r/k)*Math.cos(d)
    );
  }

  static ang(v0: Pol2, v1: Pol2, v2: Pol2, d:number|undefined=undefined) {
    // v0が原点じゃないときに対応!!!
    const k = v0.k || v1.k || v2.k;
    if(!k){
      throw new Error('failed to get curvature');
    }
    if(d === undefined) d = Pol2.dist(v1, v2);
    return Math.acos(
      (Math.cos(v2.r/k)-Math.cos(v1.r/k)*Math.cos(d/k))/
      (Math.sin(v1.r/k)*Math.sin(d/k))
    );
  }

  static mix(v1: Pol2, v2: Pol2, t: number, d:number|undefined=undefined, a:number|undefined=undefined) {
    const k = v1.k || v2.k;
    if(!k){
      throw new Error('failed to get curvature');
    }
    if(t===0)return v1;
    if(d === undefined) d = Pol2.dist(v1, v2);
    if(a === undefined) a = Pol2.ang(Pol2.O, v1, v2, d);
    const rr = k*Math.acos(
      Math.cos(v1.r/k)*Math.cos(t*d/k)+
      Math.sin(v1.r/k)*Math.sin(t*d/k)*Math.cos(a)
    );
    // 第2項，何故か符号を反転させるとうまくいく???
    const ra = v1.a-
    Math.sign(Math.PI*k-t*d)*
    Math.sign((v1.a-v2.a)%(2*Math.PI)-Math.PI)*
    Math.acos(
      (Math.cos(t*d/k)-Math.cos(v1.r/k)*Math.cos(rr/k))/
      (Math.sin(v1.r/k)*Math.sin(rr/k))
    );
    return new Pol2(v1.parent, rr, ra, v1.a);
  }
}
