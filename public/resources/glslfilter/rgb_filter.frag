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
  vec2 s = vec2(5., 1.) * 100.;
  vec2 p0 = vTexCoord * s;
  vec2 pr = floor(p0);
  vec2 p = (fract(p0) - .5) * 2.;
  float d = 1. - p.x * p.x * p.x * p.x - p.y * p.y * p.y * p.y / 1.5;
  vec4 col0 = texture2D(uTexture, pr / s + vec2(cos(uTime), sin(uTime)) / 30.);

  col0 *= vec4(mod(pr.x + 2., 3.) == 0., mod(pr.x + 1., 3.) == 0., mod(pr.x + 0., 3.) == 0., 1.);

  vec4 col = col0 * d * 2.;

  finalColor = col;
}
