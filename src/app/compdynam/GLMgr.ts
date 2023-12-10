import CreateShaders from "./CreateShaders";
import Render from "./Render";
import { VBO } from "./VBO";
import Graph from "./Graph";

export default class GLMgr {
  cvs: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  cvsResized = true;
  render = Render;
  graph = new Graph();
  uniLoc: {[Key:string]:WebGLUniformLocation | null} = {};
  vbo: VBO | null = null;
  vertices = [
    -1, -1,
    -1, +1,
    +1, -1,
    +1, +1
  ];
  indices = [
    0, 2, 1,
    2, 3, 1
  ];

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

    // 深度テストの有効化
    // this.gl.enable(this.gl.DEPTH_TEST);

    this.vbo = new VBO(this, 'aPosition', 2, this.vertices);
    this.vbo.enable();
    // IBO
    let indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), this.gl.STATIC_DRAW);

    // 解像度uniform
    this.uniLoc.res = this.gl.getUniformLocation(this.program, 'uResolution');
    this.gl.uniform2f(this.uniLoc.res, this.gl.canvas.width, this.gl.canvas.height);
  }

  updateGraphUniform() {
    //
  }
}