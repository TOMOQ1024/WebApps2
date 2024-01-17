import CreateShaders from "./CreateShaders";
import Render from "./Render";
import { VBO } from "./VBO";
import CCore from "./CubesCore";
import Vec3 from "@/src/Vec3";

export default class GLMgr {
  cvs: HTMLCanvasElement|null = null;
  gl: WebGLRenderingContext|null = null;
  program: WebGLProgram|null = null;
  render = Render;
  createShaders = CreateShaders;
  uniLoc: {[Key:string]:WebGLUniformLocation | null} = {};
  vao_ext: OES_vertex_array_object | null = null;
  VAOs: WebGLVertexArrayObjectOES[] = [];
  lightPosition = new Vec3(4.0, 0.0, 0.0);
  lightDirection = new Vec3(-0.3, 0.5, 0.7).normalized();
  ambientColor = [0.1, 0.1, 0.1, 1.0];

  constructor (public parent: CCore) { }
  
  async init () {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;
    this.gl = this.cvs.getContext('webgl')!;
    this.program = this.gl.createProgram()!;
    if(!(await this.createShaders())){
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

    // カリング，深度テスト，ブレンディングの有効化
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);

    // 深度テストの設定
    this.gl.depthFunc(this.gl.LEQUAL);
    // ブレンディングの設定
    this.gl.blendEquation(this.gl.FUNC_ADD);
    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE)

    // VAOの初期化
    for(let i=0; i<this.parent.objs.length; i++){
      this.VAOs.push(this.vao_ext.createVertexArrayOES()!);
      this.vao_ext.bindVertexArrayOES(this.VAOs[i]);
      let o = this.parent.objs[i];
  
      let pVBO = new VBO(this, 'aPosition', 3, o.position);
      pVBO.enable();
      
      let nVBO = new VBO(this, 'aNormal', 3, o.normal);
      nVBO.enable();
  
      let cVBO = new VBO(this, 'aColor', 4, o.color);
      cVBO.enable();
  
      let tVBO = new VBO(this, 'aTexCoord', 2, o.texCoord);
      tVBO.enable();
  
      // IBO
      let indexBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(o.index), this.gl.STATIC_DRAW);
    }

    // 解像度uniform
    this.uniLoc.res = this.gl.getUniformLocation(this.program, 'uResolution');


    // 行列uniform
    this.uniLoc.miMat = this.gl.getUniformLocation(this.program, "miMat")!;
    this.uniLoc.mMat = this.gl.getUniformLocation(this.program, "mMat")!;
    this.uniLoc.vMat = this.gl.getUniformLocation(this.program, "vMat")!;
    this.uniLoc.pMat = this.gl.getUniformLocation(this.program, "pMat")!;

    // 視線
    this.uniLoc.eDir = this.gl.getUniformLocation(this.program, "eyeDirection")!;
    this.gl.uniform3fv(this.uniLoc.eDir, this.parent.camera.backward.elem);
    
    // 点光源位置
    this.uniLoc.lPos = this.gl.getUniformLocation(this.program, "lightPosition")!;
    this.gl.uniform3fv(this.uniLoc.lPos, this.lightPosition.elem);
    
    // 線光源
    this.uniLoc.lDir = this.gl.getUniformLocation(this.program, "lightDirection")!;
    this.gl.uniform3fv(this.uniLoc.lDir, this.lightDirection.elem);
    
    // 環境光
    this.uniLoc.amb = this.gl.getUniformLocation(this.program, "ambientColor")!;
    this.gl.uniform4fv(this.uniLoc.amb, this.ambientColor);
  }
}