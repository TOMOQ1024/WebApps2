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

vec3 hsv2rgb(float h, float s, float v) {
  return ((clamp(abs(fract(h+vec3(0,2,1)/3.)*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;
  // return ((clamp(abs(fract(h+vec4(0.,2.,1.,1.)/3.)*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;
}

bool calc (vec2 z) {
  float x = z.x;
  float y = z.y;

  return x/* input func here */;
}

void main ()
{
  vec2 z0 = vPosition * uResolution / min(uResolution.x, uResolution.y) * uGraph.radius - uGraph.origin;
  bool a = calc(z0);


  gl_FragColor = a ? vec4(1., 1., 1., 1.) : vec4(0., 0., 0., 1.);
}
