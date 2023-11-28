import Vec2 from "@/src/Vec2";

export default class Graph {
  origin: Vec2 = new Vec2(0, 0);
  radius: number = 2;

  constructor(){}

  // x,yはキャンバス中心を原点とした座標
  /**
   * グラフのズーム
   * @param c キャンバス内座標[-1,1]
   * @param s ズーム割合
   */
  zoom(c: Vec2, s: number){
    // (x,y)を固定して scale**s 倍縮小する
    const ds = Math.exp(s/500);
    const dor = c.mul(this.radius * (1-1/ds));
    this.origin.add(dor.x, -dor.y);
    this.radius *= ds;
  }
}