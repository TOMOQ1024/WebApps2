export class Vec2 {
  constructor(public x=0, public y=0) { }

  translateX(dx: number) {
    this.x += dx;
  }

  translateY(dy: number) {
    this.y += dy;
  }
}