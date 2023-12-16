precision mediump float;
const float PI = 3.14159265359;
const float E = 2.71828182846;
varying vec2 vPosition;
uniform vec2 uResolution;
struct Graph {
  vec2 origin;
  float radius;
};
uniform Graph uGraph;

vec2 d2p(vec2 z) {
  return vec2(length(z), atan(z.y, z.x));
}

vec2 p2d(vec2 z) {
  return max(z.x, 1e-38) * vec2(cos(z.y), sin(z.y));
}

vec2 p2d(float x, float y) {
  return max(x, 1e-38) * vec2(cos(y), sin(y));
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

vec3 hsv2rgb(float h, float s, float v) {
  return ((clamp(abs(fract(h+vec3(0,2,1)/3.)*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;
  // return ((clamp(abs(fract(h+vec4(0.,2.,1.,1.)/3.)*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;
}

vec2 compdynam(vec2 z0) {
  // int i;
  vec2 z = vec2(z0.x, z0.y);

  for(int i=0; i<1/* input iter here */; i++) {
    // z = csq(z) - vec2(.6, .42);
    // z = cexp(csin(z)+vec2(.01, .2));
    // z = ccos(z) + csin(z);
    // z = cprod(cprod(z, z), z) + vec2(.54, .2);
    z = z/* input func here */;
    // z = cpow(z,(vec2(2.,0.)))-vec2(0.6, 0.)-vec2(0., .42);
  }
  return z;
}

void main ()
{
  vec2 z0 = vPosition * uResolution / min(uResolution.x, uResolution.y) * uGraph.radius - uGraph.origin;
  // vec2 z0 = vPosition * 2. - uGraph.origin;
  // vec2 z0 = vPosition;
  vec2 a = compdynam(z0);
	gl_FragColor = vec4(hsv2rgb(atan(a.y, a.x)/2./PI+1., 1., pow(1./(1.+length(a)), .1)), 1.);
}
