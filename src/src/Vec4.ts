import Vec3 from "./Vec3";

export default class Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x=0,y=0,z=0,w=0){
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  init(x=0,y=0,z=0,w=0){
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  get elem(){
    return [this.x, this.y, this.z, this.w];
  }

  static dot(lhs: Vec4, rhs: Vec4){
    return (
      lhs.x * rhs.x +
      lhs.y * rhs.y +
      lhs.z * rhs.z + 
      lhs.w * rhs.w
    );
  }

  static scale(lhs: Vec4, rhs: number){
    return new Vec4(
      lhs.x * rhs,
      lhs.y * rhs,
      lhs.z * rhs,
      lhs.w * rhs,
    )
  }

  reverse(){
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    this.w *= -1;
  }

  reversed(){
    return new Vec4(
      -this.x,
      -this.y,
      -this.z,
      -this.w,
    );
  }

  normalize(){
    const n = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);
    this.x /= n;
    this.y /= n;
    this.z /= n;
    this.w /= n;
  }

  normalized(){
    const n = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);
    return new Vec4(
      this.x / n,
      this.y / n,
      this.z / n,
      this.w / n,
    )
  }

  addBy(rhs: Vec4){
    this.x += rhs.x;
    this.y += rhs.y;
    this.z += rhs.z;
    this.w += rhs.w;
  }

  addedBy(rhs: Vec4){
    return new Vec4(
      this.x + rhs.x,
      this.y + rhs.y,
      this.z + rhs.z,
      this.w + rhs.w,
    );
  }

  subtractBy(rhs: Vec4){
    this.x -= rhs.x;
    this.y -= rhs.y;
    this.z -= rhs.z;
    this.w -= rhs.w;
  }

  subtractedBy(rhs: Vec4){
    return new Vec4(
      this.x - rhs.x,
      this.y - rhs.y,
      this.z - rhs.z,
      this.w - rhs.w,
    );
  }

  scaleBy(rhs: number){
    this.x *= rhs;
    this.y *= rhs;
    this.z *= rhs;
    this.w *= rhs;
  }

  scaledBy(rhs: number){
    return new Vec4(
      this.x * rhs,
      this.y * rhs,
      this.z * rhs,
      this.w * rhs,
    );
  }

  rounded() {
    return new Vec4(
      Math.round(this.x),
      Math.round(this.y),
      Math.round(this.z),
      Math.round(this.w),
    );
  }

  static sum(lhs: Vec4, rhs: Vec4){
    return new Vec4(
      lhs.x + rhs.x,
      lhs.y + rhs.y,
      lhs.z + rhs.z,
      lhs.w + rhs.w,
    )
  }

  get xyz () {
    return new Vec3(
      this.x,
      this.y,
      this.z,
    )
  }
}