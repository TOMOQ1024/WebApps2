export default function CreateShaders(gl: WebGLRenderingContext, program: WebGLProgram, vsid='vs', fsid='fs'){
  try {
    let vsElement = document.getElementById (vsid) as HTMLScriptElement;
    let vs: WebGLShader | null = null;
    if (vsElement.type == 'x-shader/x-vertex') {
      vs = gl.createShader(gl.VERTEX_SHADER)!;
    }
    if(vs === null)throw new Error('Vertical Shader Is Null');
    gl.shaderSource(vs, vsElement.text);
    gl.compileShader(vs);

    let fsElement = document.getElementById(fsid) as HTMLScriptElement;
    var fs: WebGLShader | null = null;
    if (fsElement.type == 'x-shader/x-fragment') {
      fs = gl.createShader(gl.FRAGMENT_SHADER);
    }
    if(fs === null)throw new Error('Fragment Shader Is Null');
    gl.shaderSource(fs, fsElement.text);
    gl.compileShader (fs);

    // WebGLProgramとシェーダをリンク
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
  }
  catch (e){
    console.error(e);
  }
}