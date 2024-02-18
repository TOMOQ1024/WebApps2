import Obj from "../objects/Object";
import Vec2 from "../Vec2";
import Vec3 from "../Vec3";
import CreateGLShaders from "./CreateGLShaders";
import { VBO } from "./VBO";

export default class GLMgrBase {
  cvs: HTMLCanvasElement|null = null;
  gl: WebGLRenderingContext|null = null;
  program: WebGLProgram|null = null;
  createShaders: Function;
  uniLoc: {[Key:string]:WebGLUniformLocation | null} = {};
  vao_ext: OES_vertex_array_object | null = null;
  VAOs: {
    vao: WebGLVertexArrayObjectOES,
    indices: number[]
  }[] = [];
  lightPosition = new Vec3(4.0, 0.0, 0.0);
  lightDirection = new Vec3(-0.3, 0.5, 0.7).normalized();
  ambientColor = [0.1, 0.1, 0.1, 1.0];

  constructor (options?: {
    createShaders: Function
  }) {
    if (options) {
      this.createShaders = options.createShaders;
    }
    else {
      this.createShaders = CreateGLShaders;
    }
  }
  
  async _init (name: string) {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;
    this.gl = this.cvs.getContext('webgl')!;
    this.program = this.gl.createProgram()!;
    if(!(await this.createShaders(name))){
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
  }

  pushVAO (obj: Obj) {
    const vao = this.vao_ext!.createVertexArrayOES()!;
    const i = this.VAOs.push({
      vao: vao,
      indices: obj.index,
    }) - 1;
    this.vao_ext!.bindVertexArrayOES(vao);

    if (obj.position.length) {
      let pVBO = new VBO(this, 'aPosition', obj.dim, obj.position);
      pVBO.enable();
    }
    
    if (obj.normal.length) {
      let nVBO = new VBO(this, 'aNormal', 3, obj.normal);
      nVBO.enable();
    }

    if (obj.color.length) {
      let cVBO = new VBO(this, 'aColor', 4, obj.color);
      cVBO.enable();
    }

    if (obj.texCoord.length) {
      let tVBO = new VBO(this, 'aTexCoord', 2, obj.texCoord);
      tVBO.enable();
    }

    // IBO
    let indexBuffer = this.gl!.createBuffer();
    this.gl!.bindBuffer(this.gl!.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl!.bufferData(this.gl!.ELEMENT_ARRAY_BUFFER, new Uint32Array(obj.index), this.gl!.STATIC_DRAW);
  }

  addUniform (name: string) {
    this.uniLoc[name] = this.gl!.getUniformLocation(this.program!, name)!;
  }

  setUniform1F (name: string, v: number) {
    this.gl!.uniform1f(this.uniLoc[name], v);
  }

  setUniform2F (name: string, v1: number, v2: number) {
    this.gl!.uniform2f(this.uniLoc[name], v1, v2);
  }

  setUniform2FV (name: string, v: Vec2) {
    this.gl!.uniform2fv(this.uniLoc[name], v.elem);
  }

  setUniform3FV (name: string, v: Vec3) {
    this.gl!.uniform3fv(this.uniLoc[name], v.elem);
  }
}