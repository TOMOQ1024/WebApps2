import CCore from "./CurvedCore";
import Pol2 from "./Pol2";

export class CObj {
  modelPos: Pol2 = new Pol2();
  position: Pol2[] = [];
  index: number[] = [];// 3
  color: number[] = [];// 4
  // normal: number[] = [];// 3
  texCoord: number[] = [];// 2
}

export class CSquare extends CObj {
  constructor(parent: CCore, r: number, v=1){
    super();

    let vertices: Pol2[] = [];
    for(let i=0; i<5; i++){
      vertices.push(new Pol2(parent, r, Math.PI/2*i));
    }
    let d=0, a=0, t, c=0, s=0, m=0;

    this.position = [Pol2.O];// 原点
    this.color = [.5, .5, .5, 1];
    this.texCoord = [.5, .5];
    for(let i=0; i<4; i++){
      d = Pol2.dist(vertices[i], vertices[i+1]);
      a = Pol2.ang(Pol2.O, vertices[i], vertices[i+1], d);
      for(let j=0; j<v; j++){
        this.position.push(Pol2.mix(vertices[i], vertices[i+1], j/v, d, a));
        this.color.push(1, 1, 1, 1);
        t = (i+j/v+.5)/2*Math.PI;
        c = Math.cos(t);
        s = Math.sin(t);
        m = Math.max(Math.abs(c), Math.abs(s))*2;
        this.texCoord.push(c/m+.5, s/m+.5);
      }
    }
    this.index = [];
    let i=1;
    for(; i<4*v; i++) {
      this.index.push(0, i, i+1);
    }
    this.index.push(0, 4*v, 1);
  }
}
