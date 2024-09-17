in vec2 vTexCoord;
in vec2 vPosition;
out vec4 finalColor;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
const float N = 5.;
const float K = 4.;
const float PI = 3.1415926535;

float R() {
  float k = cos(PI * (K - 1.) / K);
  return sqrt((1. - cos(2. * PI / N)) / (cos(2. * PI / N) - k));
}

float F() {
  float k = cos(PI * (K - 1.) / K);
  return sqrt((1. - k) / (cos(2. * PI / N) - k));
}

vec2 C(float i) {
  float a = 2. * i * PI / N;
  return F() * vec2(cos(a), sin(a));
}

float L(vec2 p) {
  return p.x * p.x + p.y * p.y;
}

float D(vec2 p, vec2 q) {
  return L(p - q);
}

bool E(vec2 p) {
  bool r = true;
  for(float i = 0.; i < N; i++) {
    if(D(p, C(i)) < R() * R()) {
      r = false;
    }
  }
  return r;
}

vec2 I0(vec2 p, float i) {
  vec2 c = C(i);
  return R() * R() / D(p, c) * (p - c) + c;
}

vec2 I(vec2 p) {
  for(float i = 0.; i < N; i++) {
    if(D(p, C(i)) < R() * R()) {
      return I0(p, i);
    }
  }
  return p;
}

void main() {
  vec2 p = vTexCoord * 2. - 1.;

  for(float i = 0.; i < 10.; i++) {
    if(E(p)) {
      float r = F() - R();
      finalColor = texture2D(uTexture, p / r / 2.25 + .5);
      // finalColor = vec4(mod(i,2.));
      // finalColor = vec4(sin(499. * p), 1., 1.);
      // if(abs(length(p) - r) < .003){
      //   finalColor = vec4(1.);
      // }
      // if(cos(N*atan(p.y,p.x))>.9)finalColor = vec4(1.);
      return;
    }
    p = I(p);
  }
  finalColor = vec4(0.);
}
