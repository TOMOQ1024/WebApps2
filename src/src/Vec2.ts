export default class Vec2 {
  constructor(public x=0, public y=0) { }

  dot(rhs: Vec2) {
    return this.x * rhs.x + this.y * rhs.y;
  }

  det(rhs: Vec2) {
    return this.x * rhs.y - this.y * rhs.x;
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

  mul(rhs: number) {
    this.x *= rhs;
    this.y *= rhs;
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
}