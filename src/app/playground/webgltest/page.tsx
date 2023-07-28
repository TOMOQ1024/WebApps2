"use client"
import MainCanvas from "@/app/components/maincanvas";
import { useEffect } from "react"
import CreateShaders from "./CreateShaders";

export default function Main(){

  useEffect(() => {
    const cvs = document.getElementById('cvs') as HTMLCanvasElement;
    const gl = cvs.getContext('webgl')!;
    let program = gl.createProgram()!;
    CreateShaders(gl, program);
    
    
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // WebGLProgramを有効化する
      gl.useProgram(program);
    }else {
      console.log (gl.getProgramInfoLog(program));
      return;
    }

    //
    let position = [
      -1.0, +1.0, +0.0,
      +1.0, +1.0, +0.0,
      -1.0, -1.0, +0.0,
      +1.0, -1.0, +0.0
    ];
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array (position), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    let index = new Uint8Array([
      0, 2, 1,
      1, 2, 3
    ]);
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
    
    let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    
    
    render ();

    function render () {
      gl.clearColor (0.8, 0.8, 0.8, 1.0);
      gl.clear (gl.COLOR_BUFFER_BIT);

      gl.viewport(0, 0, cvs.width, cvs.height);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      // 頂点属性を有効化する
      var positionAddress = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(positionAddress);
      gl.vertexAttribPointer(positionAddress, 3, gl.FLOAT, false, 0, 0);
      gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_BYTE, 0);

      //描画
      gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_BYTE, 0);
      // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    }
  }, []);


  return (
    <main
      style={{
        textAlign: 'center'
      }}
    >
      <MainCanvas/>
      {/* ソースコード内の不等号がエスケープされるため，suppressHydrationWarningでそれに起因するエラーを抑制している */}
      <script id="vs" type="x-shader/x-vertex" suppressHydrationWarning>{`
attribute vec3 position;
void main ()
{
	gl_Position = vec4(position, 1.0);
}
      `}</script>
      <script id="fs" type="x-shader/x-fragment" suppressHydrationWarning>{`
precision highp float;

uniform vec2 u_resolution;

bool mandel(vec2 c){
  vec2 z = vec2(0.);
  for(int i=0; i<50; i++){
    if(2. < length(z))return false;
    z = vec2(
      z.x*z.x - z.y*z.y + c.x,
      2.*z.x*z.y + c.y
    );
  }
  return true;
}

void main ()
{
  vec2 col = vec2(
    gl_FragCoord.x / u_resolution.x,
    gl_FragCoord.y / u_resolution.y
  );
  vec2 pos = vec2(
    col.x * 3. - 2.,
    col.y * 3. - 1.5
  );
	// gl_FragColor = vec4 (1., pos, 1.);
	gl_FragColor = mandel(pos) ? vec4 (1., col, 1.) : vec4(0.);
}
      `}</script>
    </main>
  )
}

/*


void main ()
{
  vec2 pos = vec2(
    gl_FragCoord.x / u_resolution.x,
    gl_FragCoord.y / u_resolution.y
  ) * 4. - 2.;
	gl_FragColor = vec4 (1., col, 1.);
	// gl_FragColor = 1 ? vec4 (1., col, 1.) : vec4(0.);
}
*/
