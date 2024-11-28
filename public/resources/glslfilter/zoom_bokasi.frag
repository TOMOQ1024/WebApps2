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

void main() {
  vec4 c = vec4(0.);
  float t = 0.;
  for(float x = 0.; x < 10.; x += 1.) {
    c += texture2D(uTexture, mix(vTexCoord, vec2(.1, .1), x / 100.));
    t += 1.;
  }
  finalColor = c / t;
// 	finalColor = vec4(random(uMouse), 1.);
}
