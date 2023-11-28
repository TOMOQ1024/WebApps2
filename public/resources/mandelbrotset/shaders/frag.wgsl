struct Uniforms {
  origin: vec2f,
  radius: f32,
  // resolution
}

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

fn mandel(c: vec2f) -> i32 {
  var i: i32 = 0;
  var z: vec2f = vec2f(0f, 0f);

  for (; i < 100; i++) {
    if length(z) > 2f {
      break;
    }
    z = vec2f(
      z.x * z.x - z.y * z.y + c.x,
      2f * z.x * z.y + c.y,
    );
  }
  return i;
}

@fragment fn fs(@location(1) fragPos: vec2f) -> @location(0) vec4f {
  // res, fragcoord

  let c: vec2f = fragPos * uniforms.radius - uniforms.origin;
  let i = mandel(c);

  // return vec4f(fragPos.x, fragPos.y, 0.0, 1.0);
  return vec4f(0f, select(fragPos+.75f, vec2f(0f, 0f), i<90), 1f);
}
