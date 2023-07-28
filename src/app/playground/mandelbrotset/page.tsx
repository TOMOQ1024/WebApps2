"use client"
import MainCanvas from "@/app/components/maincanvas";
import { useEffect } from "react"
import CreateShaders from "./CreateShaders";

export default function Main(){

  useEffect(() => {(async()=>{
    const cvs = document.getElementById('cvs') as HTMLCanvasElement;
    const gl = cvs.getContext('webgl')!;
    let program = gl.createProgram()!;
    if(!(await CreateShaders(gl, program))) return;
    
    
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
  })();}, []);


  return (
    <main
      style={{
        textAlign: 'center'
      }}
    >
      <MainCanvas/>
    </main>
  )
}
