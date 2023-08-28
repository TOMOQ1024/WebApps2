type Data = {
  vert: string;
  frag: string;
}

export default async function CreateShaders(gl: WebGLRenderingContext, program: WebGLProgram){
  let vs = gl.createShader(gl.VERTEX_SHADER)!;
  var fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  try {
    let response = await fetch('/api/webgltest-shaders');
    const data: Data = await response.json();

    gl.shaderSource(vs, data.vert);
    gl.shaderSource(fs, data.frag);
    if(vs === null)throw new Error('Vertical Shader Is Null');
    if(fs === null)throw new Error('Fragment Shader Is Null');
    gl.compileShader(vs);
    gl.compileShader (fs);

    console.log('vert compiled successfully: ' + gl.getShaderParameter(vs, gl.COMPILE_STATUS));
    console.log('Shader compiler log:\n' + gl.getShaderInfoLog(vs));

    console.log('frag compiled successfully: ' + gl.getShaderParameter(fs, gl.COMPILE_STATUS));
    console.log('Shader compiler log:\n' + gl.getShaderInfoLog(fs));

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