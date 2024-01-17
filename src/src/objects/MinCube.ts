import Obj from "./Object";

export default class MinCube extends Obj {
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