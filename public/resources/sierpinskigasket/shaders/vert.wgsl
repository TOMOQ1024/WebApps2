struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(1) fragPos: vec2f,
}

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> VertexOutput {
  let pos = array(
    vec2f(-1.0,  1.0),  // top left
    vec2f(-1.0, -1.0),  // bottom left
    vec2f( 1.0, -1.0),  // bottom right
    vec2f(-1.0,  1.0),  // top left
    vec2f( 1.0, -1.0),  // bottom right
    vec2f( 1.0,  1.0)   // top right
  );

  var output: VertexOutput;
  output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
  output.fragPos = pos[vertexIndex];

  return output;
}
