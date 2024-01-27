export default class Vec2 {
  constructor(public x=0, public y=0) { }

  static copy(v: Vec2) {
    return new Vec2(v.x, v.y);
  }

  static dot(lhs: Vec2, rhs: Vec2) {
    return lhs.x * rhs.x + lhs.y * rhs.y;
  }

  dot(rhs: Vec2) {
    return this.x * rhs.x + this.y * rhs.y;
  }

  det(rhs: Vec2) {
    return this.x * rhs.y - this.y * rhs.x;
  }

  length() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  add(rhs1: number|Vec2, rhs2: number|undefined = undefined) {
    if(typeof rhs1 === "number"){
      this.x += rhs1;
      this.y += rhs2 === undefined ? rhs1 : rhs2;
    }
    else {
      this.x += rhs1.x;
      this.y += rhs1.y;
    }
  }

  added(rhs1: number|Vec2, rhs2: number|undefined = undefined) {
    if(typeof rhs1 === "number"){
      return new Vec2(
        this.x + rhs1,
        this.y + (rhs2 === undefined ? rhs1 : rhs2)
      );
    }
    else {
      return new Vec2(
        this.x + rhs1.x,
        this.y + rhs1.y
      );
    }
  }

  sub(rhs1: number|Vec2, rhs2: number|undefined = undefined) {
    if(typeof rhs1 === "number"){
      this.x -= rhs1;
      this.y -= rhs2 === undefined ? rhs1 : rhs2;
    }
    else {
      this.x -= rhs1.x;
      this.y -= rhs1.y;
    }
  }

  subed(rhs1: number|Vec2, rhs2: number|undefined = undefined) {
    if(typeof rhs1 === "number"){
      return new Vec2(
        this.x - rhs1,
        this.y - (rhs2 === undefined ? rhs1 : rhs2)
      );
    }
    else {
      return new Vec2(
        this.x - rhs1.x,
        this.y - rhs1.y
      );
    }
  }

  mul(rhs: number) {
    this.x *= rhs;
    this.y *= rhs;
    return this;
  }

  muled(rhs: number) {
    return new Vec2(
      this.x * rhs,
      this.y * rhs,
    );
  }

  negY() {
    this.y = - this.y;
    return this;
  }

  translateX(dx: number) {
    this.x += dx;
    return this;
  }

  translateY(dy: number) {
    this.y += dy;
    return this;
  }

  translate(dv: Vec2) {
    this.x += dv.x;
    this.y += dv.y;
    return this;
  }

  rotatedBy (a: number): Vec2 {
    return new Vec2(
      this.x*Math.cos(a)-this.y*Math.sin(a),
      this.y*Math.cos(a)+this.x*Math.sin(a),
    );
  }
}