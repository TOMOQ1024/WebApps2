import Vec2 from "./Vec2";
import Vec3 from "./Vec3";

export default class Mat3 {
  elem: number[];

  constructor (...e:number[]) {
    this.elem = [];
    let i;
    for (i=0; i<e.length; i++) {
      this.elem.push(e[i]);
    }
    for (; i<8; i++) {
      this.elem.push(0);
    }
    for (; i<9; i++) {
      this.elem.push(1);
    }

  }

  static ZERO = new Mat3 (
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
  );

  static ONE = new Mat3 (
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
  );

  static get Identity () {
    return new Mat3 (
      1,0,0,
      0,1,0,
      0,0,1,
    )
  };

  static cMat (v: Vec2): Mat3 {
    return new Mat3 (
      0, 0, v.x,
      0, 0, v.y,
      0, 0, 1
    );
  }

  static rMat (a: number): Mat3 {
    return new Mat3 (
      Math.cos(a), -Math.sin(a), 0,
      Math.sin(a), Math.cos(a), 0,
      0, 0, 1
    );
  }

  row (i: number) {
    return new Vec3 (
      this.elem[i*3+0],
      this.elem[i*3+1],
      this.elem[i*3+2],
    );
  }

  multedByV3 (rhs: Vec3): Vec3 {
    return new Vec3 (
      this.row(0).dot(rhs),
      this.row(1).dot(rhs),
      this.row(2).dot(rhs),
    );
  }

  scaleBy(rhs: number): Mat3 {
    for (let i=0; i<9; i++) {
      this.elem[i] *= rhs;
    }
    return this;
  }

  scaledBy(rhs: number): Mat3 {
    return new Mat3(...this.elem.map(e=>e*rhs));
  }

  addBy (rhs: Mat3): Mat3 {
    for(let i=0; i<9; i++){
      this.elem[i] += rhs.elem[i];
    }
    return this;
  }

  addedBy (rhs: Mat3): Mat3 {
    let e = this.elem.slice(0);
    for(let i=0; i<9; i++){
      e[i] += rhs.elem[i];
    }
    return new Mat3(...e);
  }

  multBy (rhs: Mat3): Mat3 {
    let e: number[] = [];
    for(let i=0; i<3; i++){
      for(let j=0; j<3; j++){
        e.push(0);
        for(let k=0; k<3; k++){
          e[i*3+j] += this.elem[i*3+k] * rhs.elem[k*3+j];
        }
      }
    }
    for(let i=0; i<9; i++){
      this.elem[i] = e[i];
    }
    return this;
  }

  multedBy (rhs: Mat3): Mat3 {
    let e: number[] = [];
    for(let i=0; i<3; i++){
      for(let j=0; j<3; j++){
        e.push(0);
        for(let k=0; k<3; k++){
          e[i*3+j] += this.elem[i*3+k] * rhs.elem[k*3+j];
        }
      }
    }
    return new Mat3(...e);
  }

  mixBy (rhs: Mat3, ratio: number): Mat3 {
    return this.scaleBy(ratio).addBy(rhs.scaledBy(1-ratio));
  }

  mixedBy (rhs: Mat3, ratio: number): Mat3 {
    return this.scaledBy(ratio).addedBy(rhs.scaledBy(1-ratio));
  }

  translateBy (v: Vec2): Mat3 {
    this.elem[2] += v.dot(new Vec2(this.elem[0], this.elem[1]));
    this.elem[5] += v.dot(new Vec2(this.elem[3], this.elem[4]));
    this.elem[8] += v.dot(new Vec2(this.elem[6], this.elem[7]));
    return this;
  }

  translatedBy (v: Vec2): Mat3 {
    return new Mat3(
      ...this.elem.map(
        (e,i) => i%3-2 ? e : e+v.dot(new Vec2(this.elem[i-2], this.elem[i-1]))
      )
    );
  }

  rotatedBy (a: number) {
    return this.multedBy(Mat3.rMat(a));
  }
}