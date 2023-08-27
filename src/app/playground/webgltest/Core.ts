import Camera from "./Camera";
import CreateShaders from "./CreateShaders";
import Update from "./Update";
import Render from "./Render";

export default class GLMgr {
  cvs: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  position = [
    -1, -1, -1,
    -1, -1, +1,
    -1, +1, +1,
    -1, +1, -1,
    +1, +1, -1,
    +1, +1, +1,
    +1, -1, +1,
    +1, -1, -1,
  ];
  color = [
    1., 1., 1., 1,
    .8, .8, .8, 1,
    .6, .6, .6, 1,
    .4, .4, .4, 1,
    .2, .2, .2, 1,
    .4, .4, .4, 1,
    .6, .6, .6, 1,
    .8, .8, .8, 1,
  ];
  index = new Uint8Array([
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
  ]);
  camera = new Camera(this);
  matUpdated = true;
  cvsResized = true;
  update = Update;
  render = Render;
  keys: {[Key:string]: number} = {};
  ctrlAllowed = true;
  mMatLoc: WebGLUniformLocation | null = null;
  vMatLoc: WebGLUniformLocation | null = null;
  pMatLoc: WebGLUniformLocation | null = null;
  resLoc: WebGLUniformLocation | null = null;

  constructor () {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;
    this.gl = this.cvs.getContext('webgl')!;
    this.program = this.gl.createProgram()!;
  }

  async init () {
    if(!(await CreateShaders(this.gl, this.program))){
      console.log('hoge');
      return;
    }

    if (this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      // WebGLProgramを有効化する
      this.gl.useProgram(this.program);
    }else {
      console.log (this.gl.getProgramInfoLog(this.program));
      return;
    }

    // カリングと深度テストの有効化
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);

    // 頂点座標
    let pBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, pBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array (this.position), this.gl.STATIC_DRAW);
    let positionAddress = this.gl.getAttribLocation(this.program, "position");
    this.gl.enableVertexAttribArray(positionAddress);
    this.gl.vertexAttribPointer(positionAddress, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    // 頂点色
    let cBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array (this.color), this.gl.STATIC_DRAW);
    let colorAddress = this.gl.getAttribLocation(this.program, "a_color");
    this.gl.enableVertexAttribArray(colorAddress);
    this.gl.vertexAttribPointer(colorAddress, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    // IBO
    let indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.index, this.gl.STATIC_DRAW);
    // this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

    // 行列uniform
    this.mMatLoc = this.gl.getUniformLocation(this.program, "mMatrix")!;
    this.vMatLoc = this.gl.getUniformLocation(this.program, "vMatrix")!;
    this.pMatLoc = this.gl.getUniformLocation(this.program, "pMatrix")!;

    // 解像度uniform
    this.resLoc = this.gl.getUniformLocation(this.program, "u_resolution");
  }
}