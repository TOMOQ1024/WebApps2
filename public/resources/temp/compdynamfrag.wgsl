const pi = 3.14159265359;

struct Uniforms {
  origin: vec2f,
  radius: f32,
  // resolution
}

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

fn d2p(z: vec2f) -> vec2f {
  return vec2f(length(z), atan2(z.y, z.x));
}

fn p2d(z: vec2f) -> vec2f {
  return max(z.x, 1e-38) * vec2f(cos(z.y), sin(z.y));
}

fn cexp(z: vec2f) -> vec2f {
  return p2d(vec2f(exp(z.x), z.y));
}

fn csq(z: vec2f) -> vec2f {
  return vec2f(
    z.x * z.x - z.y * z.y,
    2. * z.x * z.y
  );
}

fn cprod(z: vec2f, w: vec2f) -> vec2f {
  return vec2f(
    z.x * w.x - z.y * w.y,
    z.x * w.y + z.y * w.x
  );
}

fn cdiv(z: vec2f, w: vec2f) -> vec2f {
  return vec2f(
    z.x * w.x + z.y * w.y,
    z.y * w.x - z.x * w.y
  ) / (w.x*w.x + w.y*w.y);
  // let Z = d2p(z);
  // let W = d2p(w);
  // return p2d(vec2f(Z.x/W.x, Z.y-W.y));
}

fn cpow(z: vec2f, w: vec2f) -> vec2f {
  // !!!
  let Z = d2p(z);
  let W = d2p(w);
  return p2d(vec2f(pow(Z.x, w.x), Z.y-W.y));
}

fn cconj(z: vec2f) -> vec2f {
  return vec2f(
    z.x, -z.y
  );
}

fn ccos(z: vec2f) -> vec2f {
  // \cos a\cosh b-i\sin a\sinh b
  return vec2f(
    cos(z.x) * cosh(z.y),
    - sin(z.x) * sinh(z.y)
  );
}

fn csin(z: vec2f) -> vec2f {
  // \cos a\cosh b-i\sin a\sinh b
  return vec2f(
    sin(z.x) * cosh(z.y),
    - cos(z.x) * sinh(z.y)
  );
}

fn ccosh(z: vec2f) -> vec2f {
  // \cos a\cosh b-i\sin a\sinh b
  return vec2f(
    cosh(z.x) * cos(z.y),
    sinh(z.x) * sin(z.y)
  );
}

fn csinh(z: vec2f) -> vec2f {
  // \cos a\cosh b-i\sin a\sinh b
  return vec2f(
    sinh(z.x) * cos(z.y),
    cosh(z.x) * sin(z.y)
  );
}

fn compdynam(z0: vec2f) -> vec2f {
  var i: i32 = 0;
  var z = vec2f(z0.x, z0.y);

  for (; i < 100; i++) {
    // exp(sin(z+0.01+0.2i))(100)
    z = ccos(z)+csin(z);
    // z = cdiv(vec2f(1., 0.), cexp(z));
    // z = csinh(z);
    // z = cprod(z, csq(z)) + vec2f(.54, .2);
    // z = cexp(-z+vec2f(0., 1.))+z;
  }
  return z;
}

fn hsv2rgb(h: f32, s: f32, v: f32) -> vec4f {
  return ((clamp(abs(fract(h+vec4f(0f,2f,1f,1f)/3f)*6f-3f)-1f,vec4f(0f,0f,0f,0f),vec4f(1f,1f,1f,1f))-1f)*s+1f)*v;
}

@fragment fn fs(@location(1) fragPos: vec2f) -> @location(0) vec4f {
  let z0 = fragPos * uniforms.radius - uniforms.origin;
  let a = compdynam(z0);

  // return vec4f(fragPos.x, fragPos.y, 0.0, 1.0);
  // return hsv2rgb(atan2(z0.y, z0.x)/2f/pi-1., 1f, pow(1f/(1f+length(z0)), .1));
  return hsv2rgb(atan2(a.y, a.x)/2f/pi+1., 1f, pow(1f/(1f+length(a)), .1));
}
