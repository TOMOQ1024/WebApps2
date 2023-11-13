import GLMgr from "./Core";

export class VBO {
  glmgr: GLMgr;
  gl: WebGLRenderingContext;
  buf: WebGLBuffer;
  attLoc: number = -1;
  name: string;
  stride: number;

  constructor(glmgr: GLMgr, name: string, stride: number, data: number[]){
    this.glmgr = glmgr;
    this.gl = glmgr.gl;
    const buf = glmgr.gl.createBuffer();
    if(!buf)throw new Error('failed to create buffer');
    this.buf = buf;
    this.name = name;
    this.stride = stride;
    this.create(data);
  }

  bind(){
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buf);
  }

  unbind(){
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  create(data: number[]){
    this.bind();
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    this.unbind();
  }
  
  enable(){
    this.bind();
    this.attLoc = this.gl.getAttribLocation(this.glmgr.program, this.name);
    if(this.attLoc === -1)throw new Error(`failed to find attribute location of '${this.name}'`);
    this.gl.enableVertexAttribArray(this.attLoc);
    this.gl.vertexAttribPointer(this.attLoc, this.stride, this.gl.FLOAT, false, 0, 0);
    this.unbind();
  }
}