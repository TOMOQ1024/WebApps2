precision mediump float;
const float PI = 3.14159265359;
const float E = 2.71828182846;
varying vec2 vPosition;
uniform vec2 uResolution;
uniform float uTime;
struct Graph {
  vec2 origin;
  float radius;
};
uniform Graph uGraph;
uniform sampler2D uTexture;

vec2 d2p(vec2 z) {
  return vec2(length(z), atan(z.y, z.x));
}

vec2 p2d(vec2 z) {
  return max(z.x, 1e-38) * vec2(cos(z.y), sin(z.y));
}

vec2 p2d(float x, float y) {
  return max(x, 1e-38) * vec2(cos(y), sin(y));
}

vec2 cre(vec2 z) {
  return vec2(z.x, 0.);
}

vec2 cim(vec2 z) {
  return vec2(z.y, 0.);
}

vec2 cexp(vec2 z) {
  return p2d(exp(z.x), z.y);
}

vec2 csq(vec2 z) {
  return vec2(
    z.x * z.x - z.y * z.y,
    2. * z.x * z.y
  );
}

vec2 cprod(vec2 z, vec2 w) {
  return vec2(
    z.x * w.x - z.y * w.y,
    z.x * w.y + z.y * w.x
  );
}

vec2 cdiv(vec2 z, vec2 w) {
  return vec2(
    z.x * w.x + z.y * w.y,
    z.y * w.x - z.x * w.y
  ) / (w.x * w.x + w.y * w.y);
}

float cosh(float x) {
  return (exp(x) + exp(-x)) / 2.;
}

float sinh(float x) {
  return (exp(x) - exp(-x)) / 2.;
}

vec2 cpow(vec2 z, vec2 w) {
  if (length(z) == 0.) return vec2(0., 0.);
  vec2 Z = d2p(z);
  return cprod(p2d(pow(Z.x,w.x), Z.y*w.x), p2d(cosh(Z.y*w.y) - sinh(Z.y*w.y), w.y*log(Z.x)));
}

vec2 cconj(vec2 z) {
  return vec2(z.x, -z.y);
}

vec2 ccos(vec2 z) {
  return vec2(
    cos(z.x) * cosh(z.y),
    - sin(z.x) * sinh(z.y)
  );
}

vec2 csin(vec2 z) {
  return vec2(
    sin(z.x) * cosh(z.y),
    - cos(z.x) * sinh(z.y)
  );
}

vec2 ctan(vec2 z) {
  return cdiv(csin(z), ccos(z));
}

vec2 ccosh(vec2 z) {
  return vec2(
    cosh(z.x) * cos(z.y),
    sinh(z.x) * sin(z.y)
  );
}

vec2 csinh(vec2 z) {
  return vec2(
    sinh(z.x) * cos(z.y),
    cosh(z.x) * sin(z.y)
  );
}

vec2 ctanh(vec2 z) {
  return cdiv(csinh(z), ccosh(z));
}

vec2 cabs(vec2 z) {
  return vec2(length(z), 0.);
}

vec2 carg(vec2 z) {
  return vec2(atan(z.y, z.x), 0.);
}

vec2 csqrt(vec2 z) {
  return cpow(z, vec2(.5, 0.));
}

vec2 ccbrt(vec2 z) {
  return cpow(z, vec2(1./3., 0.));
}

vec2 cmix(vec2 z, vec2 w, vec2 t) {
  return mix(z, w, t.x);
}

vec2 cfloor(vec2 z) {
  return vec2(
    floor(z.x),
    floor(z.y)
  );
}

vec2 cround(vec2 z) {
  return vec2(
    floor(z.x + .5),
    floor(z.y + .5)
  );
}

vec2 cceil(vec2 z) {
  return vec2(
    ceil(z.x),
    ceil(z.y)
  );
}

vec3 hsv2rgb(float h, float s, float v) {
  return ((clamp(abs(fract(h+vec3(0,2,1)/3.)*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;
  // return ((clamp(abs(fract(h+vec4(0.,2.,1.,1.)/3.)*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;
}

vec2 compdynam(vec2 C) {
  vec2 t = vec2(uTime, 0.);
  vec2 c = vec2(C);
  vec2 z = c/* input z0 here */;

  for(int i=0; i<1/* input iter here */; i++) {
    z = z/* input func here */;
    // if (40. < abs(log(length(z)))) break;
  }
  return z;
}

void main ()
{
  vec2 z0 = vPosition * uResolution / min(uResolution.x, uResolution.y) * uGraph.radius - uGraph.origin;
  vec2 a = compdynam(z0);


  if (false/* input boolean of nessy here */) {
    // vec2 A = (a*3.+1.)/2. + uTime / 4.;
    vec2 A0 = (a*3.+1.)/2.;
    // vec2 A = vec2(
    //   A0.x*cos(uTime) + A0.y*sin(uTime),
    //   A0.x*sin(uTime) - A0.y*cos(uTime)
    // );
    vec2 A = A0;
    gl_FragColor = length(a)<1e20 ? texture2D(uTexture, vec2(A.x, -A.y)) : vec4(0., 0., 0., 1.);
  }
  else {
    /* delete if mode is not hsv */gl_FragColor = vec4(hsv2rgb(atan(a.y, a.x)/2./PI+1., 1., pow(1./(1.+length(a)), .1)), 1.);
    /* delete if mode is not grayscale */gl_FragColor = vec4(hsv2rgb(0., 0., pow(1./(1.+length(a)), .1) * (1.+sin(atan(a.y, a.x)*2.))/2.), 1.);
  }
}
