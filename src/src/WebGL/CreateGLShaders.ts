import GLMgr from "./GLMgrBase";

type Data = {
  vert: string;
  frag: string;
};

export default async function CreateGLShaders(this: GLMgr, name: string) {
  let vs = this.gl!.createShader(this.gl!.VERTEX_SHADER)!;
  var fs = this.gl!.createShader(this.gl!.FRAGMENT_SHADER)!;
  try {
    let response = await fetch(`/api/shaders/${name}`);
    const data: Data = await response.json();

    this.gl!.shaderSource(vs, data.vert);
    this.gl!.shaderSource(fs, data.frag);
    if (vs === null) throw new Error("Vertical Shader Is Null");
    if (fs === null) throw new Error("Fragment Shader Is Null");
    this.gl!.compileShader(vs);
    this.gl!.compileShader(fs);

    if (!this.gl!.getShaderParameter(vs, this.gl!.COMPILE_STATUS)) {
      console.log(
        "Failed to compile vert shader.\nLog:\n" + this.gl!.getShaderInfoLog(vs)
      );
    }

    if (!this.gl!.getShaderParameter(fs, this.gl!.COMPILE_STATUS)) {
      console.log(
        "Failed to compile frag shader.\nLog:\n" + this.gl!.getShaderInfoLog(fs)
      );
    }

    // WebGLProgramとシェーダをリンク
    this.gl!.attachShader(this.program!, vs);
    this.gl!.attachShader(this.program!, fs);
    this.gl!.linkProgram(this.program!);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
