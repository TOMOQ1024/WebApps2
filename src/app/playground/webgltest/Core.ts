import CreateShaders from "./CreateShaders";
import Mat4 from "./Matrix";

export default class GLMgr {
  cvs: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  position = [
    -0.9, +0.8, +0.0,
    +0.8, +0.9, +0.0,
    -0.8, -0.9, +0.0,
    +0.9, -0.8, +0.0
  ];
  index = new Uint8Array([
    0, 2, 1,
    1, 2, 3
  ]);
  positionBuffer: WebGLBuffer;

  constructor () {
    this.cvs = document.getElementById('cvs') as HTMLCanvasElement;
    this.gl = this.cvs.getContext('webgl')!;
    this.program = this.gl.createProgram()!;
    this.positionBuffer = this.gl.createBuffer()!;
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

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array (this.position), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    
    let indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.index, this.gl.STATIC_DRAW);

    // 行列
    console.log(Mat4.prod(
      new Mat4(
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
      ),
      new Mat4(
        1, 1, 1, 1,
        0, 1, 1, 1,
        0, 0, 1, 1,
        0, 0, 0, 1,
      ),
    ));
    const mMatrix = Mat4.Identity;// モデル変換行列
    const vMatrix = Mat4.vMatrix(
      0, 1, 3,
      0, 0, 0,
      0, 1, 0,
    );
    const pMatrix = Mat4.pMatrix(90 * Math.PI / 180, this.gl.canvas.width / this.gl.canvas.height, 0.1, 100);
    let mvpMatrix = Mat4.prodn(pMatrix, vMatrix, mMatrix);
    let matrixUniformLocation = this.gl.getUniformLocation(this.program, "mvpMatrix");
    this.gl.uniformMatrix4fv(matrixUniformLocation, false, mvpMatrix.elem);

    // 解像度
    let resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_resolution");
    this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

    this.render();
  }

  render () {
    this.gl.clearColor (0.8, 0.8, 0.8, 1.0);
    this.gl.clearDepth (1.0);
    this.gl.clear (this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.viewport(0, 0, this.cvs.width, this.cvs.height);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    // 頂点属性を有効化する
    var positionAddress = this.gl.getAttribLocation(this.program, "position");
    this.gl.enableVertexAttribArray(positionAddress);
    this.gl.vertexAttribPointer(positionAddress, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.drawElements(this.gl.TRIANGLES, this.index.length, this.gl.UNSIGNED_BYTE, 0);

    //描画
    this.gl.drawElements(this.gl.TRIANGLES, this.index.length, this.gl.UNSIGNED_BYTE, 0);
    // this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 3);

    // コンテキストの再描画
    this.gl.flush();
  }
}