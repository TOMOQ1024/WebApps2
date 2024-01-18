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

  static ZERO = new Vec3 ();
  static ONE = new Vec3 (1, 1, 1);

  get elem(){
    return [this.x, this.y, this.z];
  }

  static dot(lhs: Vec3, rhs: Vec3){
    return (
      lhs.x * rhs.x +
      lhs.y * rhs.y +
      lhs.z * rhs.z
    );
  }

  dot(rhs: Vec3){
    return (
      this.x * rhs.x +
      this.y * rhs.y +
      this.z * rhs.z
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
    return this;
  }

  crossedBy(rhs: Vec3){
    return new Vec3(
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

  addedBy(rhs: Vec3){
    return new Vec3(
      this.x + rhs.x,
      this.y + rhs.y,
      this.z + rhs.z,
    );
  }

  subtractBy(rhs: Vec3){
    this.x -= rhs.x;
    this.y -= rhs.y;
    this.z -= rhs.z;
  }

  subtractedBy(rhs: Vec3){
    return new Vec3(
      this.x - rhs.x,
      this.y - rhs.y,
      this.z - rhs.z,
    );
  }

  dividedBy (rhs: Vec3) {
    return new Vec3(
      this.x / rhs.x,
      this.y / rhs.y,
      this.z / rhs.z,
    );
  }

  scaledBy(rhs: number){
    return new Vec3(
      this.x * rhs,
      this.y * rhs,
      this.z * rhs,
    )
  }

  rounded() {
    return new Vec3(
      Math.round(this.x),
      Math.round(this.y),
      Math.round(this.z),
    )
  }

  moded (m: number) {
    return new Vec3(
      (Math.floor(this.x % m) + m) % m,
      (Math.floor(this.y % m) + m) % m,
      (Math.floor(this.z % m) + m) % m,
    )
  }

  equalTo (rhs: Vec3) {
    return (
      this.x === rhs.x &&
      this.y === rhs.y &&
      this.z === rhs.z
    );
  }

  notEqualTo (rhs: Vec3) {
    return (
      this.x !== rhs.x ||
      this.y !== rhs.y ||
      this.z !== rhs.z
    );
  }

  static sum(lhs: Vec3, rhs: Vec3){
    return new Vec3(
      lhs.x + rhs.x,
      lhs.y + rhs.y,
      lhs.z + rhs.z,
    )
  }

  abs () {
    return new Vec3(
      Math.abs(this.x),
      Math.abs(this.y),
      Math.abs(this.z),
    )
  }

  max (rhs: Vec3) {
    return new Vec3(
      Math.max(this.x, rhs.x),
      Math.max(this.y, rhs.y),
      Math.max(this.z, rhs.z),
    )
  }

  length () {
    return Math.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z
    );
  }

  get x_z(){
    return new Vec3(
      this.x,
      0,
      this.z
    );
  }
}