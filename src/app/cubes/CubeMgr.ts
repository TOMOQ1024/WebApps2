import Mat4 from "@/src/Mat4";
import Cube from "@/src/objects/Cube";
import Sphere from "@/src/objects/Sphere";
import Torus from "@/src/objects/Torus";
import Vec2 from "@/src/Vec2";
import Vec3 from "@/src/Vec3";
import Vec4 from "@/src/Vec4";
import CCore from "./CubesCore";

export default class CubeMgr {
  cubes: Cube[] = [];
  private _size = new Vec3(5, 5, 5);
  get size() {
    return this._size;
  }
  set size(s: Vec3) {
    this._size = s.rounded();
  }
  pointer = new Vec3();

  constructor (public parent: CCore) {
    const B = [0., 0., 0., 1.];
    const S = this.size.subtractedBy(new Vec3(1, 1, 1)).scaledBy(.5);
    for (let z=-S.z; z<=S.z; z++) {
      for (let y=-S.y; y<=S.y; y++) {
        for (let x=-S.x; x<=S.x; x++) {
          const c = new Cube(
            new Vec3(x, y, z).scaledBy(2),
            1.
          );
          c.color = [
            x<=-S.x ? [1., .5, 0., 1.] : B,// -x
            +S.x<=x ? [1., 0., 0., 1.] : B,// +x
            y<=-S.y ? [1., 1., 1., 1.] : B,// -y
            +S.y<=y ? [1., 1., 0., 1.] : B,// +y
            z<=-S.z ? [0., .8, 0., 1.] : B,// -z
            +S.z<=z ? [0., 0., 1., 1.] : B,// +z
          ].map(v=>[v, v, v, v]).flat(2);
          this.cubes.push(c);
        }
      }
    }
  }

  rotate (index: number, num: number) {
    let axis: Vec3;
    if (index < this.size.x) {
      axis = new Vec3(1, 0, 0);
    }
    else if ((index -= this.size.x) < this.size.y) {
      axis = new Vec3(0, 1, 0);
    }
    else if ((index -= this.size.y) < this.size.z) {
      axis = new Vec3(0, 0, 1);
    }
    else return;

    const S = this.size.subtractedBy(new Vec3(1, 1, 1));
    // console.log(S);
    for (let i=0; i<this.cubes.length; i++) {
      const c = this.cubes[i];
      const p = (c.mdlMat.transposed().multedBy(new Vec4(0, 0, 0, 1)) as Vec4).xyz.addedBy(S).scaledBy(.5);
      if (axis.x && Math.abs(p.x - index) > .1) continue;
      if (axis.y && Math.abs(p.y - index) > .1) continue;
      if (axis.z && Math.abs(p.z - index) > .1) continue;
      c.mdlMat.multBy(Mat4.Identity.rotated(axis, Math.PI/2*num));
    }
  }

  normalize () {
    const S = this.size.subtractedBy(new Vec3(1, 1, 1));
    let parity: Vec3|null = null;
    let prevElems: number[][] = [];
    let newMats: Mat4[] = [];
    let poses: Vec3[] = [];
    let newCubes: (Cube|null)[] = [];

    for (let i=0; i<this.cubes.length; i++) {
      newCubes.push(null);
      prevElems.push(this.cubes[i].mdlMat.elem.slice(0));
      newMats.push(this.cubes[i].mdlMat.roundedBy(1));
      const p = (newMats[i].transposed().multedBy(new Vec4(0, 0, 0, 1)) as Vec4).xyz;
      poses.push(p);
      if(!parity){
        parity = p.moded(2);
      }
      else if (parity.notEqualTo(p.moded(2))) {
        return false;
      }
    }
    for (let i=0; i<this.cubes.length; i++) {
      const p = poses[i].addedBy(S).scaledBy(.5);
      this.cubes[i].mdlMat = newMats[i];
      newCubes[(p.z*this.size.y+p.y)*this.size.x+p.x] = this.cubes[i];
    }
    return true;
  }

  onMouseMove (p: Vec2) {
    const vi = this.parent.vMatrix.transposed().inversed();
    const pi = this.parent.pMatrix.transposed().inversed();
    const vipi = vi.multedBy(pi) as Mat4;
    const d0 = vipi.multedBy(new Vec4(p.x, p.y, -1, .1)) as Vec4;
    d0.scaleBy(1/d0.w);
    const d1 = vipi.multedBy(new Vec4(p.x, p.y, 1, 1)) as Vec4;
    d1.scaleBy(1/d1.w);
    let ori = d0.xyz;
    let dir = d1.subtractedBy(d0).normalized().xyz;
    let dist: number;
    for (let i=0; i<100; i++) {
      const q = ori.abs().subtractedBy(this.size);
      dist = q.max(Vec3.ZERO).length() + Math.min(Math.max(q.x,q.y,q.z), 0);
      ori.addBy(dir.scaledBy(dist));
      if (dist < .01) {
        // let s = new Torus(6, 6, 0, .1);
        // s.mdlMat.translateBy(ori);
        // this.parent.addObj(s);
        this.pointer = ori;
        return true;
      }
    }
    this.pointer = Vec3.ZERO;
    return false;
  }

  onClick () {
    if (this.pointer.equalTo(Vec3.ZERO)) return;
    const S = this.size.subtractedBy(new Vec3(1, 1, 1));
    const p = this.pointer.dividedBy(this.size);
    const pa = p.abs();
    const M = Math.max(...pa.elem);
    const m = Math.min(...pa.elem);
    // 絶対値によりxyzを優先順位づけしたVec3
    // 0: 回転の軸
    const a = new Vec3(
      pa.x === M ? 2 : pa.x === m ? 0 : 1,
      pa.y === M ? 2 : pa.y === m ? 0 : 1,
      pa.z === M ? 2 : pa.z === m ? 0 : 1,
    );
    const pM = new Vec3(
      a.x === 2 ? p.x : 0,
      a.y === 2 ? p.y : 0,
      a.z === 2 ? p.z : 0,
    );
    const pn = new Vec3(
      a.x === 1 ? p.x : 0,
      a.y === 1 ? p.y : 0,
      a.z === 1 ? p.z : 0,
    );
    const r = this.pointer.addedBy(S).scaledBy(.5).rounded();
    const index = (
      (a.x ? 0 : r.x) +
      (a.y ? 0 : r.y + this.size.x) +
      (a.z ? 0 : r.z + this.size.x + this.size.y)
    );
    const ang = -Math.sign(pn.dot(Vec3.ONE))*
    Math.sign(pn.abs().crossedBy(pM.abs()).dot(Vec3.ONE))*
    Math.sign(pM.dot(Vec3.ONE));
    for (let i=0; i<6; i++) {
      setTimeout(()=> {
        this.rotate(index, ang/6);
      }, 10*i);
    }
  }
}