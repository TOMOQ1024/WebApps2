import hsva from "../Color";
import Obj from "./Object";

// !!!
export default class Sphere extends Obj {
  constructor(row: number, column: number, r: number){
    super();
    for(let i=0; i<row; i++){
      let p = Math.PI*2/row*i;
      for(let j=0; j<column; j++){
        let q = Math.PI*(j/column-.5);
        this.position.push(
          r * Math.cos(q) * Math.cos(p),
          r * Math.sin(q),
          r * Math.cos(q) * Math.sin(p)
        );
        this.normal.push(
          r * Math.cos(q) * Math.cos(p),
          r * Math.sin(q),
          r * Math.cos(q) * Math.sin(p)
        );
        // this.color.push(1, 1, 1, 1);
        this.color.push(...hsva(360/row*i, 1, 1, 1)!);
      }
    }
    for(let i=0; i<row; i++){
      for(let j=0; j<column; j++){
        let v = column * i + j;
        this.index.push(v, v+1, v+column);
        this.index.push(v+column, v+1, v+column+1);
      }
    }
    this.index.map(i=>(i%(row*column)+row*column)%(row*column));
    console.log(this.position.length, this.color.length, this.index.length);
    // for(var i = 0; i <= row; i++){
    //     var r = Math.PI * 2 / row * i;
    //     var rr = Math.cos(r);
    //     var ry = Math.sin(r);
    //     for(var ii = 0; ii <= column; ii++){
    //         var tr = Math.PI * 2 / column * ii;
    //         var tx = (rr * irad + orad) * Math.cos(tr);
    //         var ty = ry * irad;
    //         var tz = (rr * irad + orad) * Math.sin(tr);
    //         pos.push(tx, ty, tz);
    //         var tc = hsva(360 / column * ii, 1, 1, 1) as number[];
    //         col.push(tc[0], tc[1], tc[2], tc[3]);
    //     }
    // }
    // for(i = 0; i < row; i++){
    //     for(ii = 0; ii < column; ii++){
    //         r = (column + 1) * i + ii;
    //         idx.push(r, r + column + 1, r + 1);
    //         idx.push(r + column + 1, r + column + 2, r + 1);
    //     }
    // }
    // this.position = pos;
    // this.index = idx.map(i=>i%(row*column));
    // this.color = col;
  }
}
