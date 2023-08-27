export default class Vec3 {
  x: number;
  y: number;
  z: number;

  constructor(x=0,y=0,z=0){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  init(x=0,y=0,z=0){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static dot(lhs: Vec3, rhs: Vec3){
    return (
      lhs.x * rhs.x +
      lhs.y * rhs.y +
      lhs.z * rhs.z
    );
  }

  static cross(lhs: Vec3, rhs: Vec3){
    return new Vec3(
      lhs.y * rhs.z - lhs.z * rhs.y,
      lhs.z * rhs.x - lhs.x * rhs.z,
      lhs.x * rhs.y - lhs.y * rhs.x,
    );
  }

  static scale(lhs: Vec3, rhs: number){
    return new Vec3(
      lhs.x * rhs,
      lhs.y * rhs,
      lhs.z * rhs,
    )
  }

  reverse(){
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
  }

  reversed(){
    return new Vec3(
      -this.x,
      -this.y,
      -this.z,
    );
  }

  normalize(){
    const n = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    this.x /= n;
    this.y /= n;
    this.z /= n;
  }

  normalized(){
    const n = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    return new Vec3(
      this.x / n,
      this.y / n,
      this.z / n,
    )
  }

  crossBy(rhs: Vec3){
    this.init(
      this.y * rhs.z - this.z * rhs.y,
      this.z * rhs.x - this.x * rhs.z,
      this.x * rhs.y - this.y * rhs.x,
    );
  }

  addBy(rhs: Vec3){
    this.x += rhs.x;
    this.y += rhs.y;
    this.z += rhs.z;
  }

  sum(lhs: Vec3, rhs: Vec3){
    return new Vec3(
      lhs.x + rhs.x,
      lhs.y + rhs.y,
      lhs.z + rhs.z,
    )
  }

  get x_z(){
    return new Vec3(
      this.x,
      0,
      this.z
    );
  }
}