import Mat4 from "../Mat4";

export default class Obj {
  position: number[] = [];
  index: number[] = [];
  color: number[] = [];
  normal: number[] = [];
  texCoord: number[] = [];
  mdlMat: Mat4 = Mat4.Identity;

  constructor (public dim: number = 3) { }
}
