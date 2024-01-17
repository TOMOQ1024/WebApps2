import Mat4 from "@/src/Mat4";
import Cube from "@/src/objects/Cube";
import Vec3 from "@/src/Vec3";
import Vec4 from "@/src/Vec4";
import CCore from "./CubesCore";

export default class CubeMgr {
  cubes: Cube[] = [];
  private _size = new Vec3(3, 3, 2);
  get size() {
    return this._size;
  }
  set size(s: Vec3) {
    this._size = s.rounded();
  }

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
      const p = c.mdlMat.transposed().multedBy(new Vec4(0, 0, 0, 1)).xyz.addedBy(S).scaledBy(.5);
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
      const p = newMats[i].transposed().multedBy(new Vec4(0, 0, 0, 1)).xyz;
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
}