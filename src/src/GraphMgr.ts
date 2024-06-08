import { Vector2 } from "three";

export default class GraphMgr {
  origin = new Vector2(0, 0);
  radius = 2;

  constructor(){}

  // x,yはキャンバス中心を原点とした座標
  /**
   * グラフのズーム
   * @param c キャンバス内座標[-1,1]
   * @param s ズーム割合
   */
  zoom(c: Vector2, s: number){
    // (x,y)を固定して scale**s 倍縮小する
    const ds = Math.exp(s/500);
    const dor = c.clone().multiplyScalar(this.radius*(1-1/ds)).multiply({x: 1, y: -1})
    this.origin.add(dor);
    this.radius *= ds;
  }

  translate(v: Vector2) {
    this.origin.add(v.clone().multiplyScalar(this.radius));
  }
}