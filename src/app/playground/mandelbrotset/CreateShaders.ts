type Data = {
  vert: string;
  frag: string;
}

export default async function CreateShaders(gl: WebGLRenderingContext, program: WebGLProgram){
  let vs = gl.createShader(gl.VERTEX_SHADER)!;
  var fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  try {
    let response = await fetch('/api/mandel-shaders');
    const data: Data = await response.json();

    gl.shaderSource(vs, data.vert);
    gl.shaderSource(fs, data.frag);
    if(vs === null)throw new Error('Vertical Shader Is Null');
    if(fs === null)throw new Error('Fragment Shader Is Null');
    gl.compileShader(vs);
    gl.compileShader (fs);

    // WebGLProgramとシェーダをリンク
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return true;
  }
  catch (e){
    console.error(e);
    return false;
  }
}