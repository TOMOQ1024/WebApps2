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
  return vec4f(0f, select(fragPos*.25f+.75f, vec2f(0f, 0f), i<90), 1f);
}

/*

鏡餅brot
struct Uniforms {
  origin: vec2f,
  radius: f32,
  // resolution
}

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct MandelOut {
  z0: vec2f,
  z: vec2f,
  i: i32
}

fn mandel(c: vec2f) -> MandelOut {
  var i: i32 = 0;
  var z: vec2f = vec2f(0f, 0f);

  for (; i < 1000; i++) {
    if length(z) > 20. {
      break;
    }
    z = vec2f(
      z.x * z.x - z.y * z.y + c.x,
      2f * z.x * z.y + c.y,
    );
  }
  return MandelOut(
    c,
    z,
    i
  );
}

fn calcI(m: MandelOut) -> vec4f {
  let c = m.z0;
  let z0 = m.z;
  var z = vec2f(m.z);
  var i: i32 = 0;

  for (; i < 50;) {
    if length(z) > 20. {
      i = -1;
      break;
    }
    z = vec2f(
      z.x * z.x - z.y * z.y + c.x,
      2f * z.x * z.y + c.y,
    );
    i++;
    if distance(z, z0) < 1e-2 {
      break;
    }
  }

  return select(
    vec4f(1.),
    select(
      vec4f(1., .5, 0., 1.),
      vec4f(0., .5, 0., 1.),
      i/4%2 == 0
    ),
    i%4 == 0
  );
}

@fragment fn fs(@location(1) fragPos: vec2f) -> @location(0) vec4f {
  // res, fragcoord

  let c: vec2f = fragPos * uniforms.radius - uniforms.origin;
  let m: MandelOut = mandel(c);
  let i = m.i;

  // return vec4f(fragPos.x, fragPos.y, 0.0, 1.0);
  return select(
    calcI(m),
    select(vec4f(1., 0., 0., 1.), vec4f(1.), m.z.x*m.z.y<0),
    length(m.z) > 2.
  );
  // return vec4f(0f, select(fragPos*.25f+.75f, vec2f(0f, 0f), i<90), 1f);
}


*/