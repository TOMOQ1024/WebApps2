import hsva from "./Color";
import Mat4 from "./Matrix";

export class Obj {
  position: number[] = [];
  index: number[] = [];
  color: number[] = [];
  normal: number[] = [];
  texCoord: number[] = [];
  mdlMat: Mat4 = Mat4.Identity;
}

export class Cube extends Obj {
  constructor(){
    super();
    this.position = [
      -1, -1, -1,
      -1, -1, +1,
      -1, +1, +1,
      -1, +1, -1,
      +1, +1, -1,
      +1, +1, +1,
      +1, -1, +1,
      +1, -1, -1,
    ];
    this.normal = [
      -1, -1, -1,
      -1, -1, +1,
      -1, +1, +1,
      -1, +1, -1,
      +1, +1, -1,
      +1, +1, +1,
      +1, -1, +1,
      +1, -1, -1,
    ].map(n=>n/Math.sqrt(3));
    this.index = [
      0, 1, 2,
      6, 2, 1,
      1, 0, 6,
      7, 6, 0,
      6, 7, 4,
      0, 4, 7,
      4, 0, 3,
      2, 3, 0,
      3, 2, 4,
      5, 4, 2,
      2, 6, 5,
      4, 5, 6,
    ];
    this.color = [
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 1, 1,
    ];
    this.color = this.color.map(v=>v*0.8);
    this.texCoord = [
      0, 0,
      0, 1,
      1, 1,
      1, 0,
      1, 1,
      1, 0,
      0, 0,
      0, 1,
    ];
  }
}

// export class Sphere extends Obj {
//   constructor(row: number, column: number, r: number){
//     super();
//     this.position = [];
//     this.color = [];
//     this.index = [];
//     for(let i=0; i<row; i++){
//       let p = Math.PI*2/row*i;
//       for(let j=0; j<column; j++){
//         let q = Math.PI*(j/column-.5);
//         this.position.push(
//           r * Math.cos(q) * Math.cos(p),
//           r * Math.sin(q),
//           r * Math.cos(q) * Math.sin(p)
//         );
//         // this.color.push(1, 1, 1, 1);
//         this.color.push(...hsva(360/row*i, 1, 1, 1)!);
//       }
//     }
//     for(let i=0; i<row; i++){
//       for(let j=0; j<column; j++){
//         let v = column * i + j;
//         this.index.push(v, v+1, v+column);
//         this.index.push(v+column, v+1, v+column+1);
//       }
//     }
//     this.index.map(i=>(i%(row*column)+row*column)%(row*column));
//     console.log(this.position.length, this.color.length, this.index.length);
//     // for(var i = 0; i <= row; i++){
//     //     var r = Math.PI * 2 / row * i;
//     //     var rr = Math.cos(r);
//     //     var ry = Math.sin(r);
//     //     for(var ii = 0; ii <= column; ii++){
//     //         var tr = Math.PI * 2 / column * ii;
//     //         var tx = (rr * irad + orad) * Math.cos(tr);
//     //         var ty = ry * irad;
//     //         var tz = (rr * irad + orad) * Math.sin(tr);
//     //         pos.push(tx, ty, tz);
//     //         var tc = hsva(360 / column * ii, 1, 1, 1) as number[];
//     //         col.push(tc[0], tc[1], tc[2], tc[3]);
//     //     }
//     // }
//     // for(i = 0; i < row; i++){
//     //     for(ii = 0; ii < column; ii++){
//     //         r = (column + 1) * i + ii;
//     //         idx.push(r, r + column + 1, r + 1);
//     //         idx.push(r + column + 1, r + column + 2, r + 1);
//     //     }
//     // }
//     // this.position = pos;
//     // this.index = idx.map(i=>i%(row*column));
//     // this.color = col;
//   }
// }

export class Torus extends Obj {
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
