struct Uniforms {
  origin: vec2f,
  radius: f32,
  // resolution
}

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

fn f(x: f32) -> f32 {
  var s = 0f;
  for(var i = 1i; i<30; i++){
    if floor(log2(x)) < f32(i) {
      break;
    }
    s += floor(x / pow(2f, f32(i)));
  }
  return s;
}

fn gasket(c: vec2f) -> bool {
  return 1f > f(c.x+c.y) - f(c.x) - f(c.y);
}

@fragment fn fs(@location(1) fragPos: vec2f) -> @location(0) vec4f {

  var c: vec2f = fragPos * uniforms.radius - uniforms.origin;
  c = vec2f(c.x - .5f*c.y, c.y);

  return vec4f(0f, select(fragPos*.25f+.75f, vec2f(0f, 0f), gasket(c)), 1f);
}
