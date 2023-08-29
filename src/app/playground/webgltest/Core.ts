import Camera from "./Camera";
import CreateShaders from "./CreateShaders";
import Update from "./Update";
import Render from "./Render";
import { Cube, Obj, Torus } from "./Object";
import Vec3 from "./Vector";
import Mat4 from "./Matrix";
import { VBO } from "./VBO";

export default class GLMgr {
  cvs: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  objects: Obj[] = [new Torus(50, 30, 5, 1), new Cube()];
  // object: Obj = new Sphere(10, 3, 1);
  object: Obj = this.objects[0];
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
  uniLoc: {[Key:string]:WebGLUniformLocation | null} = {};
  vao_ext: OES_vertex_array_object | null = null;
  VAOs: (WebGLVertexArrayObjectOES | null)[] = [];
  lightPosition = new Vec3(4.0, 0.0, 0.0);
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
    // this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);

    // VAOの初期化
    for(let i=0; i<this.objects.length; i++){
      this.VAOs.push(this.vao_ext.createVertexArrayOES()!);
      this.vao_ext.bindVertexArrayOES(this.VAOs[i]);
      this.object = this.objects[i];

      let pVBO = new VBO(this, 'aPosition', 3, this.position);
      pVBO.enable();
      
      let nVBO = new VBO(this, 'aNormal', 3, this.normal);
      nVBO.enable();
  
      let cVBO = new VBO(this, 'aColor', 4, this.color);
      cVBO.enable();
  
      // IBO
      let indexBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.index), this.gl.STATIC_DRAW);
    }


    // 行列uniform
    this.uniLoc.miMat = this.gl.getUniformLocation(this.program, "miMat")!;
    this.uniLoc.mMat = this.gl.getUniformLocation(this.program, "mMat")!;
    this.uniLoc.vMat = this.gl.getUniformLocation(this.program, "vMat")!;
    this.uniLoc.pMat = this.gl.getUniformLocation(this.program, "pMat")!;

    // 視線
    this.uniLoc.eDir = this.gl.getUniformLocation(this.program, "eyeDirection")!;
    this.gl.uniform3fv(this.uniLoc.eDir, this.camera.backward.elem);
    
    // 光源
    this.uniLoc.lPos = this.gl.getUniformLocation(this.program, "lightPosition")!;
    this.gl.uniform3fv(this.uniLoc.lPos, this.lightPosition.elem);
    
    // 光源
    this.uniLoc.lDir = this.gl.getUniformLocation(this.program, "lightDirection")!;
    this.gl.uniform3fv(this.uniLoc.lDir, this.lightDirection.elem);
    
    // 環境光
    this.uniLoc.amb = this.gl.getUniformLocation(this.program, "ambientColor")!;
    this.gl.uniform4fv(this.uniLoc.amb, this.ambientColor);

    // 解像度uniform
    this.uniLoc.res = this.gl.getUniformLocation(this.program, "uResolution");

    // console.log(this.object.mdlMat.elem);
    // console.log(this.object.mdlMat.inverse().elem);
    // console.log(Mat4.prod(this.object.mdlMat, this.object.mdlMat.inverse()).elem);
  }
}