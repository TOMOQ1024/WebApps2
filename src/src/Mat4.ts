import Vec3 from "./Vec3";
import Vec4 from "./Vec4";

export default class Mat4 {
  elem: number[];

  constructor(...e:number[]){
    this.elem = [];
    let i;
    for(i=0; i<e.length; i++){
      this.elem.push(e[i]);
    }
    for(; i<16; i++){
      this.elem.push(0);
    }
  }

  static get Identity(){
    return new Mat4(
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1,
    )
  };

  // ビュー変換行列
  static vMatrix(
    e: Vec3,// 視点位置
    t: Vec3,// 視線
    u: Vec3,// 視線に対する上の向き
  ){
    let Z = t.reversed().normalized();
    let X = Vec3.cross(u,Z).normalized();
    let Y = Vec3.cross(Z,X).normalized();
    let T = new Vec3(
      -Vec3.dot(X,e),
      -Vec3.dot(Y,e),
      -Vec3.dot(Z,e),
    );

    return new Mat4(
      X.x, Y.x, Z.x, 0,
      X.y, Y.y, Z.y, 0,
      X.z, Y.z, Z.z, 0,
      T.x, T.y, T.z, 1,
    );
  }

  // perspective
  static pMatrix(
    fovy: number, aspect: number,
    near: number, far: number,
  ){
		let t = near * Math.tan(fovy / 2);
		let r = t * aspect;
		let a = r * 2, b = t * 2, c = far - near;
    return new Mat4(
      near * 2 / a, 0, 0, 0,
      0, near * 2 / b, 0, 0,
      0, 0, -(far + near) / c, -1,
      0, 0, -(far * near * 2) / c, 0,
    );
  }

  addBy(rhs: Mat4): void{
    let e: number[] = [];
    for(let i=0; i<4; i++){
      for(let j=0; j<4; j++){
        e.push(0);
        for(let k=0; k<4; k++){
          e[i*4+j] += this.elem[i*4+k] * rhs.elem[k*4+j];
        }
      }
    }
    for(let i=0; i<16; i++){
      this.elem[i] = e[i];
    }
  }

  multBy(rhs: Mat4): void{
    let e: number[] = [];
    for(let i=0; i<4; i++){
      for(let j=0; j<4; j++){
        e.push(0);
        for(let k=0; k<4; k++){
          e[i*4+j] += this.elem[i*4+k] * rhs.elem[k*4+j];
        }
      }
    }
    for(let i=0; i<16; i++){
      this.elem[i] = e[i];
    }
  }

  multedBy (rhs: Mat4|Vec4) {
    if (rhs.elem.length === 4) {
      let e: number[] = [];
      for(let i=0; i<4; i++){
        e.push(0);
        for(let j=0; j<4; j++){
          e[i] += this.elem[i*4+j] * rhs.elem[j];
        }
      }
      return new Vec4(...e);
    }
    else {
      let e: number[] = [];
      for(let i=0; i<4; i++){
        for(let j=0; j<4; j++){
          e.push(0);
          for(let k=0; k<4; k++){
            e[i*4+j] += this.elem[i*4+k] * rhs.elem[k*4+j];
          }
        }
      }
      return new Mat4(...e);
    }
  }

  sum(lhs: Mat4, rhs: Mat4): Mat4{
    let e: number[] = [];
    for(let i=0; i<4; i++){
      for(let j=0; j<4; j++){
        e.push(0);
        for(let k=0; k<4; k++){
          e[i*4+j] += lhs.elem[i*4+k] * rhs.elem[k*4+j];
        }
      }
    }
    return new Mat4(...e);
  }

  static prod(lhs: Mat4, rhs: Mat4): Mat4{
    let e: number[] = [];
    for(let i=0; i<4; i++){
      for(let j=0; j<4; j++){
        e.push(0);
        for(let k=0; k<4; k++){
          e[i*4+j] += lhs.elem[k*4+j] * rhs.elem[i*4+k];
        }
      }
    }
    return new Mat4(...e);
  }

  static prodn(...m:Mat4[]){
    return m.reduce((a,b)=>Mat4.prod(a,b));
  }

  static scale(lhs: Mat4, rhs: number): Mat4{
    return new Mat4(...lhs.elem.map(e=>e*rhs));
  }

  scaledBy(rhs: number): Mat4{
    return new Mat4(...this.elem.map(e=>e*rhs));
  }

  inversed(){
    let e: number[] = [];
    let det = 0;
    let m3: number[];
    let m3d: number;
    for(let i=0; i<16; i++)e.push(0);
    for(let I=0; I<4; I++){
      for(let J=0; J<4; J++){
        m3 = [];
        for(let i=0; i<4; i++){
          if(i === I)continue;
          for(let j=0; j<4; j++){
            if(j === J)continue;
            m3.push(this.elem[i*4+j]);
          }
        }
        m3d = m3[0]*m3[4]*m3[8] + m3[1]*m3[5]*m3[6] + m3[2]*m3[3]*m3[7]
            - m3[0]*m3[5]*m3[7] - m3[1]*m3[3]*m3[8] - m3[2]*m3[4]*m3[6];
        if(J===0)det += ((I+J)%2?-1:1) * this.elem[I*4+J] * m3d;
        e[J*4+I] = ((I+J)%2?-1:1) * m3d;
      }
    }
    return new Mat4(...e.map(a=>a/det));
  }

  rotated(axis: Vec3, angle: number){
    const na = axis.normalized();
    const d = Math.sin(angle), e = Math.cos(angle), f = 1 - e;
    const v0 = new Vec3(
      na.x * na.x * f + e,
      na.y * na.x * f + na.z * d,
      na.z * na.x * f - na.y * d,
    );
    const v1 = new Vec3(
      na.x * na.y * f - na.z * d,
			na.y * na.y * f + e,
			na.z * na.y * f + na.x * d,
    );
    const v2 = new Vec3(
      na.x * na.z * f + na.y * d,
			na.y * na.z * f - na.x * d,
			na.z * na.z * f + e,
    );
    const a0 = new Vec3(this.elem[0], this.elem[4], this.elem[8]);
    const a1 = new Vec3(this.elem[1], this.elem[5], this.elem[9]);
    const a2 = new Vec3(this.elem[2], this.elem[6], this.elem[10]);
    const a3 = new Vec3(this.elem[3], this.elem[7], this.elem[11]);
    return new Mat4(
      Vec3.dot(a0,v0), Vec3.dot(a1,v0), Vec3.dot(a2,v0), Vec3.dot(a3,v0),
      Vec3.dot(a0,v1), Vec3.dot(a1,v1), Vec3.dot(a2,v1), Vec3.dot(a3,v1),
      Vec3.dot(a0,v2), Vec3.dot(a1,v2), Vec3.dot(a2,v2), Vec3.dot(a3,v2),
      this.elem[12], this.elem[13], this.elem[14], this.elem[15]
    );
  }

  rotate(axis: Vec3, angle: number){
    this.elem = this.rotated(axis, angle).elem;
  }

  translated(v: Vec3){
    const v0 = new Vec3(this.elem[0], this.elem[4], this.elem[8]);
    const v1 = new Vec3(this.elem[1], this.elem[5], this.elem[9]);
    const v2 = new Vec3(this.elem[2], this.elem[6], this.elem[10]);
    const v3 = new Vec3(this.elem[3], this.elem[7], this.elem[11]);
    return new Mat4(
      v0.x, v1.x, v2.x, v3.x,
      v0.y, v1.y, v2.y, v3.y,
      v0.z, v1.z, v2.z, v3.z,
      this.elem[12]+Vec3.dot(v0, v),
      this.elem[13]+Vec3.dot(v1, v),
      this.elem[14]+Vec3.dot(v2, v),
      this.elem[15]+Vec3.dot(v3, v),
    );
  }

  translateBy(v: Vec3){
    this.elem = this.translated(v).elem;
  }

  roundBy(s: number) {
    this.elem = this.elem.map(v=>Math.round(v/s)*s);
  }

  roundedBy(s: number) {
    return new Mat4(...this.elem.map(v=>Math.round(v/s)*s));
  }

  transposed() {
    return new Mat4(
      this.elem[ 0], this.elem[ 4], this.elem[ 8], this.elem[12], 
      this.elem[ 1], this.elem[ 5], this.elem[ 9], this.elem[13], 
      this.elem[ 2], this.elem[ 6], this.elem[10], this.elem[14], 
      this.elem[ 3], this.elem[ 7], this.elem[11], this.elem[15], 
    );
  }

  transpose () {
    this.elem = [
      this.elem[ 0], this.elem[ 4], this.elem[ 8], this.elem[12], 
      this.elem[ 1], this.elem[ 5], this.elem[ 9], this.elem[13], 
      this.elem[ 2], this.elem[ 6], this.elem[10], this.elem[14], 
      this.elem[ 3], this.elem[ 7], this.elem[11], this.elem[15], 
    ];
  }

  // translate(mat, vec)

  // rotate(mat, angle, axis)

  // lookAt(eye, center, up)

  // perspective(fovy, aspect, near, far)

  // transpose

  // inverse
}