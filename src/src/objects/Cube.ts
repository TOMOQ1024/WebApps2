import Mat4 from "../Mat4";
import Vec3 from "../Vec3";
import Obj from "./Object";

export default class Cube extends Obj {
  constructor(
    center: Vec3,
    width: number
  ){
    super();
    for (let i=0; i<3; i++) {
      for (let j=0; j<2; j++) {
        const n = new Vec3(
          i===0 ? 1 : 0,
          i===1 ? 1 : 0,
          i===2 ? 1 : 0,
        ).scaledBy(
          j*2-1
        );
        for (let k=0; k<2; k++) {
          for (let l=0; l<2; l++) {
            const p = n.addedBy(new Vec3(
              i===0 ? 0 : i===1 ? k*2-1 : l*2-1,
              i===1 ? 0 : i===2 ? k*2-1 : l*2-1,
              i===2 ? 0 : i===0 ? k*2-1 : l*2-1,
            )).scaledBy(width);
            this.position.push(...p.elem);
            this.normal.push(...n.elem);
            this.color.push(1, 1, 1, 1);
            this.texCoord.push(k, l);
          }
        }
        const o = (i*2+j)*4;
        if (j) {
          this.index.push(
            o+0, o+1, o+2,
            o+2, o+1, o+3,
          );
        }
        else {
          this.index.push(
            o+0, o+2, o+1,
            o+2, o+3, o+1,
          );
        }
      }
    }
    this.mdlMat.translateBy(center);
  }
}