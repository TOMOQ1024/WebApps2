import { Vector2 } from "three";

const RADIUS_MIN = 1e-12;
const RADIUS_MAX = 1e9;

export default class GraphMgr {
  constructor(public origin = new Vector2(0, 0), public radius = 2) {}

  private sanitize() {
    if (!Number.isFinite(this.origin.x)) {
      this.origin.x = 0;
    }
    if (!Number.isFinite(this.origin.y)) {
      this.origin.y = 0;
    }
    if (!Number.isFinite(this.radius) || this.radius <= 0) {
      this.radius = 2;
    }
    this.radius = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, this.radius));
  }

  // x,yはキャンバス中心を原点とした座標
  /**
   * グラフのズーム
   * @param c キャンバス内座標[-1,1]
   * @param s ズーム割合
   */
  zoom(c: Vector2, s: number) {
    // (x,y)を固定して scale**s 倍縮小する
    const ds = Math.exp(s / 500);
    if (!Number.isFinite(ds) || ds <= 0) {
      return;
    }
    const dor = c
      .clone()
      .multiplyScalar(this.radius * (1 - 1 / ds))
      .multiply({ x: 1, y: -1 });
    this.origin.add(dor);
    this.radius *= ds;
    this.sanitize();
  }

  translate(v: Vector2) {
    this.origin.add(v.clone().multiplyScalar(this.radius));
    this.sanitize();
  }
}
