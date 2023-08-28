import Camera from "./Camera";
import CreateShaders from "./CreateShaders";
import Update from "./Update";
import Render from "./Render";
import { Cube, Obj, Torus } from "./Object";
import Vec3 from "./Vector";
import Mat4 from "./Matrix";

export default class GLMgr {
  cvs: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  // objects: Obj[] = [new Cube()];
  // object: Obj = new Sphere(10, 3, 1);
  object: Obj = new Torus(30, 20, 3, 1);
  // object: Obj = new Cube();
  get position(){return this.object.position;}
  get index(){return this.object.index;}
  get color(){return this.object.color;}
  get normal(){return this.object.normal;}
  camera = new Camera(this);
  matUpdated = true;
  cvsResized = true;
  update = Update;
  render = Render;
  keys: {[Key:string]: number} = {};
  ctrlAllowed = true;
  miMatLoc: WebGLUniformLocation | null = null;
  mMatLoc: WebGLUniformLocation | null = null;
  vMatLoc: WebGLUniformLocation | null = null;
  pMatLoc: WebGLUniformLocation | null = null;
  lDirLoc: WebGLUniformLocation | null = null;
  eDirLoc: WebGLUniformLocation | null = null;
  ambLoc: WebGLUniformLocation | null = null;
  resLoc: WebGLUniformLocation | null = null;
  vao_ext: OES_vertex_array_object | null = null;
  vao: WebGLVertexArrayObjectOES | null = null;
  lightDirection = new Vec3(-0.5, 0.5, 0.5);
  ambientColor = [0.1, 0.1, 0.1, 1.0];

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
    let positionAddress = this.gl.getAttribLocation(this.program, "aPosition");
    this.gl.enableVertexAttribArray(positionAddress);
    this.gl.vertexAttribPointer(positionAddress, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    // 法線
    let nBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, nBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array (this.normal), this.gl.STATIC_DRAW);
    let normalAddress = this.gl.getAttribLocation(this.program, "aNormal");
    this.gl.enableVertexAttribArray(normalAddress);
    this.gl.vertexAttribPointer(normalAddress, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    // 頂点色
    let cBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cBuf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array (this.color), this.gl.STATIC_DRAW);
    let colorAddress = this.gl.getAttribLocation(this.program, "aColor");
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
    this.miMatLoc = this.gl.getUniformLocation(this.program, "miMat")!;
    this.mMatLoc = this.gl.getUniformLocation(this.program, "mMat")!;
    this.vMatLoc = this.gl.getUniformLocation(this.program, "vMat")!;
    this.pMatLoc = this.gl.getUniformLocation(this.program, "pMat")!;

    // 視線
    this.eDirLoc = this.gl.getUniformLocation(this.program, "eyeDirection")!;
    this.gl.uniform3fv(this.eDirLoc, this.camera.backward.elem);
    
    // 光源
    this.lDirLoc = this.gl.getUniformLocation(this.program, "lightDirection")!;
    this.gl.uniform3fv(this.lDirLoc, this.lightDirection.elem);
    
    // 環境光
    this.ambLoc = this.gl.getUniformLocation(this.program, "ambientColor")!;
    this.gl.uniform4fv(this.ambLoc, this.ambientColor);

    // 解像度uniform
    this.resLoc = this.gl.getUniformLocation(this.program, "uResolution");

    // console.log(this.object.mdlMat.elem);
    // console.log(this.object.mdlMat.inverse().elem);
    // console.log(Mat4.prod(this.object.mdlMat, this.object.mdlMat.inverse()).elem);
  }
}