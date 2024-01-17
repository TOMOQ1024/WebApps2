import hsva from "../Color";
import Obj from "./Object";

export default class Torus extends Obj {
  constructor(row: number, column: number, R: number, r: number){
    super();
    this.position = [];
    this.color = [];
    this.index = [];
    for(let i=0; i<=row; i++){
      let p = Math.PI*2/row*i;
      for(let j=0; j<=column; j++){
        let q = Math.PI*2/column*j;
        this.position.push(
          (r * Math.cos(q) + R) * Math.cos(p),
          r * Math.sin(q),
          (r * Math.cos(q) + R) * Math.sin(p)
        );
        this.normal.push(
          Math.cos(q) * Math.cos(p),
          Math.sin(q),
          Math.cos(q) * Math.sin(p)
        );
        // this.color.push(1, 1, 1, 1);
        // this.color.push(.2, .2, .2, .2);
        this.color.push(...hsva(360/row*i, 1, 1, 1)!);
        this.texCoord.push(
          (Math.cos(p)+1)/2, (Math.sin(q)+1)/2
        );
      }
    }
    for(let i=0; i<row; i++){
      for(let j=0; j<column; j++){
        let v = (column+1) * i + j;
        this.index.push(v, v+1, v+column+1);
        this.index.push(v+column+1, v+1, v+column+2);
      }
    }
    console.log(this.position.length, this.color.length, this.index.length);
  }
}