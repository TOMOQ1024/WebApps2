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
  positionBuffer: WebGLBuffer;
  colorBuffer: WebGLBuffer;
  camera = new Camera(this);
  matUpdated = true;
  update = Update;
  render = Render;
  keys: {[Key:string]: number} = {};
  ctrlAllowed = true;

  constructor () {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;
    this.gl = this.cvs.getContext('webgl')!;
    this.program = this.gl.createProgram()!;
    this.positionBuffer = this.gl.createBuffer()!;
    this.colorBuffer = this.gl.createBuffer()!;
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

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array (this.position), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array (this.color), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    
    let indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.index, this.gl.STATIC_DRAW);

    // 解像度
    let resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_resolution");
    this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
  }
}