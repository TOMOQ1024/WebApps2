import Vec3 from "./Vector";

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

  static Identity = new Mat4(
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1,
  );

  // ビュー変換行列
  static vMatrix(
    ex: number, ey:number, ez:number,// 視点位置
    tx: number, ty:number, tz:number,// 視線
    ux: number, uy:number, uz:number,// 視線に対する上の向き
  ){
    let e = new Vec3(ex, ey, ez);
    let t = new Vec3(tx, ty, tz);
    let u = new Vec3(ux, uy, uz);

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

  scale(lhs: Mat4, rhs: number): Mat4{
    return new Mat4(...lhs.elem.map(e=>e*rhs));
  }

  // translate(mat, vec)

  // rotate(mat, angle, axis)

  // lookAt(eye, center, up)

  // perspective(fovy, aspect, near, far)

  // transpose

  // inverse
}