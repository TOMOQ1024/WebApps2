import CreateShaders from "./CreateShaders";
import Render from "./Render";
import { VBO } from "./VBO";
import CDCore from "./RayMarchingCore";

export default class GLMgr {
  cvs: HTMLCanvasElement|null = null;
  gl: WebGLRenderingContext|null = null;
  program: WebGLProgram|null = null;
  render = Render;
  createShaders = CreateShaders;
  uniLoc: {[Key:string]:WebGLUniformLocation | null} = {};
  vao_ext: OES_vertex_array_object | null = null;
  vao: WebGLVertexArrayObjectOES | null = null;
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

  constructor (public parent: CDCore) { }
  
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
    this.vao = this.vao_ext.createVertexArrayOES();
    if(this.vao == null){
      alert('failed to create vertex array object');
      return;
    }
    this.vao_ext.bindVertexArrayOES(this.vao);

    let pVBO = new VBO(this, 'aPosition', 2, this.vertices);
    pVBO.enable();

    // IBO
    let indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), this.gl.STATIC_DRAW);

    // 解像度uniform
    this.uniLoc.res = this.gl.getUniformLocation(this.program, 'uResolution');

    this.uniLoc.camori = this.gl.getUniformLocation(this.program, 'uCamera.origin');
    this.uniLoc.camdir = this.gl.getUniformLocation(this.program, 'uCamera.forward');
  }

  updateGraphUniform() {
    // this.gl!.uniform2f(
    //   this.uniLoc.camori,
    //   this.parent.graph.origin.x,
    //   this.parent.graph.origin.y,
    // );
    // this.gl!.uniform1f(
    //   this.uniLoc.ghr,
    //   this.parent.graph.radius,
    // );
  }

  updateResolutionUniform() {
    this.gl!.uniform2f(this.uniLoc.res, this.cvs!.width, this.cvs!.height);
  }
}