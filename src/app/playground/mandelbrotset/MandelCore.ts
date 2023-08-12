import CreateShaders from "./CreateShaders";

class Graph {
  x0 = 0;
  y0 = 0;
  r = 2;

  scale = 1.01;

  // x,yはキャンバス中心を原点とした座標
  zoom(x: number, y: number, s: number){
    // (x,y)を固定して scale**s 倍縮小する
    const ds = Math.exp(s/500);
    this.x0 += x * this.r * (1-1/ds);
    this.y0 -= y * this.r * (1-1/ds);
    this.r *= ds;
  }
}

export default class MandelCore {
  cvs: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  position = [
    -1.0, +1.0, +0.0,
    +1.0, +1.0, +0.0,
    -1.0, -1.0, +0.0,
    +1.0, -1.0, +0.0
  ];
  index = new Uint8Array([
    0, 2, 1,
    1, 2, 3
  ]);
  positionBuffer: WebGLBuffer;

  graph = new Graph();

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

    let resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_resolution");
    this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

    this.updateGraphUniform();

    this.render();
  }

  render () {
    this.gl.clearColor (0.8, 0.8, 0.8, 1.0);
    this.gl.clear (this.gl.COLOR_BUFFER_BIT);

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
  }

  updateGraphUniform(){
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_graph.x0"), this.graph.x0);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_graph.y0"), this.graph.y0);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, "u_graph.r"), this.graph.r);
  }
}