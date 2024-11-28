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

vec2 random2(vec2 st) {
  st = vec2(dot(st, vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

float perlinNoise(vec2 st) {
  vec2 p = floor(st);
  vec2 f = fract(st);
  vec2 u = f * f * (3.0 - 2.0 * f);

  vec2 v00 = random2(p + vec2(0, 0));
  vec2 v10 = random2(p + vec2(1, 0));
  vec2 v01 = random2(p + vec2(0, 1));
  vec2 v11 = random2(p + vec2(1, 1));

  return mix(mix(dot(v00, f - vec2(0, 0)), dot(v10, f - vec2(1, 0)), u.x), mix(dot(v01, f - vec2(0, 1)), dot(v11, f - vec2(1, 1)), u.x), u.y) + 0.5;
}

void main() {
  float a = perlinNoise(vTexCoord * 2. + vec2(0., 1.) * uTime / 2.);
  float b = perlinNoise(vTexCoord * 2. + vec2(0., 1.) * uTime / 2. + 2.);
  float t = mix(a, b, (1. + sin(uTime)) / 2.);
  t = fract(t * 20.);
  // finalColor = (texture2D(uTexture,vTexCoord)+1.5*vec4(0., t*.7, t, t))/2.;
  finalColor = vec4(1., t * .4 + .6, t * .8, 1.);
// 	finalColor = vec4(random(uMouse), 1.);
}
