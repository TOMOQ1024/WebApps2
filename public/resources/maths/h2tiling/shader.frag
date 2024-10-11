precision mediump float;

varying vec2 vPosition;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;
uniform float A;
uniform vec2 C;
uniform float R;
const float PI = 3.1415926535;

bool E(vec2 p) {
  if(p.y < 0.)
    return false;
  if(p.x * sin(PI / A) - p.y * cos(PI / A) < 0.)
    return false;
  if(distance(p, C) < R) {
    return false;
  }
  return true;
}

vec2 I(vec2 p) {
  if(p.y < 0.)
    return vec2(p.x, -p.y);
  if(p.x * sin(PI / A) - p.y * cos(PI / A) < 0.)
    return p - 2. * (sin(PI / A) * p.x - cos(PI / A) * p.y) * vec2(sin(PI / A), -cos(PI / A));
  if(distance(p, C) < R) {
    return R * R / dot(p - C, p - C) * (p - C) + C;
  }
  return p;
}

void main() {
  vec2 p = vPosition * uResolution / min(uResolution.x, uResolution.y);

  for(float i = 0.; i < 10./* input iteration limit here */; i++) {
    if(E(p)) {
      gl_FragColor = vec4(mod(i, 2.));
      return;
    }
    p = I(p);
  }
  gl_FragColor = vec4(0., 0., 0., 1.);
}
