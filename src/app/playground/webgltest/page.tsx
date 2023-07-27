"use client"
import MainCanvas from "@/app/components/maincanvas";
import { useEffect } from "react"

export default function Main(){

  useEffect(() => {
    const cvs = document.getElementById('cvs') as HTMLCanvasElement;
    const gl = cvs.getContext('webgl')!;
    let vsElement = document.getElementById ('vs') as HTMLScriptElement;
    let vs: WebGLShader | null = null;
    if (vsElement.type == 'x-shader/x-vertex') {
      vs = gl.createShader(gl.VERTEX_SHADER)!;
    }
    if(vs === null)return;
    // シェーダオブジェクトに頂点シェーダーを代入
    gl.shaderSource(vs, vsElement.text);
    // 頂点シェーダをコンパイル
    gl.compileShader(vs);

    let fsElement = document.getElementById('fs') as HTMLScriptElement;
    var fs: WebGLShader | null = null;
    if (fsElement.type == 'x-shader/x-fragment') {
      fs = gl.createShader(gl.FRAGMENT_SHADER);
    }
    if(fs === null)return;
    // シェーダオブジェクトにフラグメントシェーダを代入
    gl.shaderSource(fs, fsElement.text);
    // フラグメントシェーダをコンパイル
    gl.compileShader (fs);

    // WebGLProgramとシェーダをリンク
    let program = gl.createProgram()!;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // WebGLProgramを有効化する
      gl.useProgram(program);
    }else {
      console.log (gl.getProgramInfoLog(program));
      return;
    }

    // 空のバッファ生成
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let position = [
      +0.0, +0.8, +0.0,
      -0.8, -0.8, +0.0,
      +0.8, -0.8, +0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array (position), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    
    
    render ();

    function render () {
      gl.clearColor (0.8, 0.8, 0.8, 1.0);
      gl.clear (gl.COLOR_BUFFER_BIT);

      gl.viewport(0, 0, cvs.width, cvs.height);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      var positionAddress = gl.getAttribLocation(program, "position");
      // 頂点属性を有効化する
      gl.enableVertexAttribArray(positionAddress);
      gl.vertexAttribPointer(positionAddress, 3, gl.FLOAT, false, 0, 0);

      //描画
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    }
  }, []);


  return (
    <main
      style={{
        textAlign: 'center'
      }}
    >
      <MainCanvas/>
      <script id="vs" type="x-shader/x-vertex">{`
attribute vec3 position;
void main ()
{
	gl_Position = vec4(position, 1.0);
}
      `}</script>
      <script id="fs" type="x-shader/x-fragment">{`
precision highp float;

uniform vec2 u_resolution;

void main ()
{
  vec2 col = vec2(
    gl_FragCoord.x / u_resolution.x,
    gl_FragCoord.y / u_resolution.y
  );
	gl_FragColor = vec4 (1., col, 1.);
}
      `}</script>
    </main>
  )
}
