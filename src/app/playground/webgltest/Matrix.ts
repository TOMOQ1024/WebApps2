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

  static I = new Mat4(
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1,
  );

  add(rhs: Mat4): void{
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

  mult(lhs: Mat4, rhs: Mat4): void{
    let e: number[] = [];
    for(let i=0; i<4; i++){
      for(let j=0; j<4; j++){
        e.push(0);
        for(let k=0; k<4; k++){
          e[i*4+j] += lhs.elem[i*4+k] * rhs.elem[k*4+j];
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

  prod(lhs: Mat4, rhs: Mat4): Mat4{
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

  scale(lhs: Mat4, rhs: number): Mat4{
    return new Mat4(...lhs.elem.map(e=>e*rhs));
  }
}