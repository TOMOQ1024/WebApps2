export class GyrovectorSpace {
  private _curvature = -1;

  /**
   * Curvature
   */
  get curvature() {
    return this._curvature;
  }

  set curvature(c: number) {
    this._curvature = c;
  }

  /**
   * Radius of Curvature
   */
  get radius() {
    return 1 / Math.sqrt(Math.abs(this._curvature));
  }

  set radius(r: number) {
    if (!r) throw new Error("曲率半径は0に設定できません");
    this._curvature = r;
  }

  constructor(c: number) {
    this.curvature = c;
  }
}
