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
  return -1. + 2. * fract(sin(st) * 43758.5453123);
}

float perlinNoise(vec2 st) {
  vec2 p = floor(st);
  vec2 f = fract(st);
  vec2 u = f * f * (3. - 2. * f);

  vec2 v00 = random2(p + vec2(0, 0));
  vec2 v01 = random2(p + vec2(0, 1));
  vec2 v10 = random2(p + vec2(1, 0));
  vec2 v11 = random2(p + vec2(1, 1));

  return mix(mix(dot(v00, f - vec2(0, 0)), dot(v10, f - vec2(1, 0)), u.x), mix(dot(v01, f - vec2(0, 1)), dot(v11, f - vec2(1, 1)), u.x), u.y) + .5;
}

float fBm(vec2 st) {
  float f = 0.;
  vec2 q = st;

  f += 0.5000 * perlinNoise(q);
  q = q * 2.01;
  f += 0.2500 * perlinNoise(q);
  q = q * 2.02;
  f += 0.1250 * perlinNoise(q);
  q = q * 2.03;
  f += 0.0625 * perlinNoise(q);
  q = q * 2.01;

  return f;
}

void main() {
  vec4 col0 = texture2D(uTexture, vTexCoord);
  vec4 col1 = vec4((1. + cos(uTime) / 2.), (1. + sin(uTime) / 2.), 1., 1.);

  vec4 col = mix(col0, col1, fBm(vTexCoord * 8.));

  finalColor = col;
}
