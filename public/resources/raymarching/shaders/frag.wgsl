// struct Camera {
//   pos: vec4f,
//   dir: vec4f,
// }

// @binding(0) @group(0) var<uniform> camera : Camera;

@fragment fn fs(@location(1) fragPos: vec2f) -> @location(0) vec4f {
  var ray: vec4f;

  return vec4f(0f, .3f, .3f, 1f);
}
