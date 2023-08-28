import Camera from "./Camera";
import CreateShaders from "./CreateShaders";
import Update from "./Update";
import Render from "./Render";
import { Cube, Obj, Torus } from "./Object";

export default class GLMgr {
  cvs: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  // objects: Obj[] = [new Cube()];
  // object: Obj = new Sphere(10, 3, 1);
  object: Obj = new Torus(20, 10, 1, .4);
  // object: Obj = new Cube();
  get position(){return this.object.position;}
  get index(){return this.object.index;}
  get color(){return this.object.color;}
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
  vao_ext: OES_vertex_array_object | null = null;
  vao: WebGLVertexArrayObjectOES | null = null;

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

    // 拡張機能の導入
    this.gl.getExtension('OES_element_index_uint');
    this.vao_ext = this.gl.getExtension('OES_vertex_array_object');
    if(this.vao_ext == null){
      alert('vertex array object not supported');
      return;
    }

    // カリングと深度テストの有効化
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);

    // VAO
    this.vao = this.vao_ext.createVertexArrayOES()!;
    this.vao_ext.bindVertexArrayOES(this.vao);

    // 頂点座標
    let pBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, pBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array (this.position), this.gl.STATIC_DRAW);
    // this.gl.bufferData(this.gl.ARRAY_BUFFER, this.position.length * 4, this.gl.STATIC_DRAW);
    let positionAddress = this.gl.getAttribLocation(this.program, "position");
    this.gl.enableVertexAttribArray(positionAddress);
    this.gl.vertexAttribPointer(positionAddress, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    // 頂点色
    let cBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array (this.color), this.gl.STATIC_DRAW);
    // this.gl.bufferData(this.gl.ARRAY_BUFFER, this.color.length * 4, this.gl.STATIC_DRAW);
    let colorAddress = this.gl.getAttribLocation(this.program, "a_color");
    this.gl.enableVertexAttribArray(colorAddress);
    this.gl.vertexAttribPointer(colorAddress, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    // IBO
    let indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.index), this.gl.STATIC_DRAW);
    // this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.index.length * Uint16Array.BYTES_PER_ELEMENT, this.gl.STATIC_DRAW);
    // this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

    // 行列uniform
    this.mMatLoc = this.gl.getUniformLocation(this.program, "mMatrix")!;
    this.vMatLoc = this.gl.getUniformLocation(this.program, "vMatrix")!;
    this.pMatLoc = this.gl.getUniformLocation(this.program, "pMatrix")!;

    // 解像度uniform
    this.resLoc = this.gl.getUniformLocation(this.program, "u_resolution");
  }
}