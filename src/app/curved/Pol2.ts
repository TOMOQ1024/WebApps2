import Vec2 from "@/src/Vec2";

export default class Pol2 {
  constructor (
    public r=1,
    public a=1
  ) {}

  xy() {
    return new Vec2(
      this.r * Math.cos(this.a),
      this.r * Math.sin(this.a)
    );
  }
}