import Camera from "./Camera";
import CreateShaders from "./CreateShaders";
import Update from "./Update";
import Render from "./Render";
import Obj from "@/src/objects/Object";
import Vec3 from "@/src/Vec3";
import { VBO } from "./VBO";
import loadImage from "./Image";
import Core from "./Core";
import MinCube from "@/src/objects/MinCube";
import Torus from "@/src/objects/Torus";

export default class GLMgr {
  cvs: HTMLCanvasElement | null = null;
  gl: WebGLRenderingContext | null = null;
  program: WebGLProgram | null = null;
  objects: Obj[] = [new Torus(50, 30, 5, 1), new MinCube()];
  // object: Obj = new Sphere(10, 3, 1);
  object: Obj = this.objects[0];
  // object: Obj = new Cube();
  get position() {
    return this.object.position;
  }
  get index() {
    return this.object.index;
  }
  get normal() {
    return this.object.normal;
  }
  get color() {
    return this.object.color;
  }
  get texCoord() {
    return this.object.texCoord;
  }
  matUpdated = true;
  cvsResized = true;
  update = Update;
  render = Render;
  uniLoc: { [Key: string]: WebGLUniformLocation | null } = {};
  vao_ext: OES_vertex_array_object | null = null;
  VAOs: (WebGLVertexArrayObjectOES | null)[] = [];
  lightPosition = new Vec3(4.0, 0.0, 0.0);
  lightDirection = new Vec3(-0.5, 0.5, 0.5);
  ambientColor = [0.1, 0.1, 0.1, 1.0];

  constructor(public parent: Core) {}

  async init() {
    this.cvs = document.getElementById("cvs") as HTMLCanvasElement;
    this.gl = this.cvs.getContext("webgl")!;
    this.program = this.gl.createProgram()!;

    if (!(await CreateShaders(this.gl, this.program))) {
      console.log("hoge");
      return;
    }

    if (this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      // WebGLProgramを有効化する
      this.gl.useProgram(this.program);
    } else {
      console.log(this.gl.getProgramInfoLog(this.program));
      return;
    }

    // 拡張機能の導入
    this.gl.getExtension("OES_element_index_uint");
    this.vao_ext = this.gl.getExtension("OES_vertex_array_object");
    if (this.vao_ext == null) {
      alert("vertex array object not supported");
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
    // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.DST_ALPHA);
    // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.blendFuncSeparate(
      this.gl.SRC_ALPHA,
      this.gl.ONE_MINUS_SRC_ALPHA,
      this.gl.ONE,
      this.gl.ONE
    );

    // VAOの初期化
    for (let i = 0; i < this.objects.length; i++) {
      this.VAOs.push(this.vao_ext.createVertexArrayOES()!);
      this.vao_ext.bindVertexArrayOES(this.VAOs[i]);
      this.object = this.objects[i];

      let pVBO = new VBO(this, "aPosition", 3, this.position);
      pVBO.enable();

      let nVBO = new VBO(this, "aNormal", 3, this.normal);
      nVBO.enable();

      let cVBO = new VBO(this, "aColor", 4, this.color);
      cVBO.enable();

      let tVBO = new VBO(this, "aTexCoord", 2, this.texCoord);
      tVBO.enable();

      // IBO
      let indexBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      this.gl.bufferData(
        this.gl.ELEMENT_ARRAY_BUFFER,
        new Uint32Array(this.index),
        this.gl.STATIC_DRAW
      );
    }

    // 行列uniform
    this.uniLoc.miMat = this.gl.getUniformLocation(this.program, "miMat")!;
    this.uniLoc.mMat = this.gl.getUniformLocation(this.program, "mMat")!;
    this.uniLoc.vMat = this.gl.getUniformLocation(this.program, "vMat")!;
    this.uniLoc.pMat = this.gl.getUniformLocation(this.program, "pMat")!;

    // 視線
    this.uniLoc.eDir = this.gl.getUniformLocation(
      this.program,
      "eyeDirection"
    )!;
    this.gl.uniform3fv(this.uniLoc.eDir, this.parent.camera.backward.elem);

    // 光源
    this.uniLoc.lPos = this.gl.getUniformLocation(
      this.program,
      "lightPosition"
    )!;
    this.gl.uniform3fv(this.uniLoc.lPos, this.lightPosition.elem);

    // 光源
    this.uniLoc.lDir = this.gl.getUniformLocation(
      this.program,
      "lightDirection"
    )!;
    this.gl.uniform3fv(this.uniLoc.lDir, this.lightDirection.elem);

    // 環境光
    this.uniLoc.amb = this.gl.getUniformLocation(this.program, "ambientColor")!;
    this.gl.uniform4fv(this.uniLoc.amb, this.ambientColor);

    // 解像度uniform
    this.uniLoc.res = this.gl.getUniformLocation(this.program, "uResolution");

    // テクスチャ
    let img0 = await loadImage("/images/webgltest/mandel-colorful.png");
    let tex0 = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex0);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      img0
    );
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.uniLoc.tex0 = this.gl.getUniformLocation(this.program, "uImage0");

    // let img1 = await loadImage('/images/webgltest/mandelbrotset.png');
    // let tex1 = this.gl.createTexture();
    // this.gl.bindTexture(this.gl.TEXTURE_2D, tex1);
    // this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img1);
    // this.gl.generateMipmap(this.gl.TEXTURE_2D);
    // this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    // this.uniLoc.tex1 = this.gl.getUniformLocation(this.program, "uImage1");

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex0);
    this.gl.uniform1i(this.uniLoc.tex0, 0);

    // this.gl.activeTexture(this.gl.TEXTURE1);
    // this.gl.bindTexture(this.gl.TEXTURE_2D, tex1);
    // this.gl.uniform1i(this.uniLoc.tex1, 1);
  }
}
