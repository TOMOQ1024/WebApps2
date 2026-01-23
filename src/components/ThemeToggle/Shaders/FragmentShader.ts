/**
 * ThemeToggle 用フラグメントシェーダー
 *
 * uniforms:
 * - uTime: 経過時間（秒）
 * - uTheme: [0, 2) の連続値（0-1: light, 1-2: dark）
 *
 * varying:
 * - vUv: [0, 1] に正規化された UV 座標
 */
export const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uTheme;
varying vec2 vUv;

#define PI 3.14159265358979323846

float smoothDelta(float x) {
  return pow(2.0, 1.0 / (x * x + 1.0)) - 1.0;
}

float impSun(float x, float y) {
  float r = x * x + y * y;
  float a = 1.0 - 2.0 * abs(r - 3.0);
  float c = cos(5.0 * atan(y, x));
  float b = r - 3.0 * asin(c * c) - 3.0;
  return max(a, b);
}

float impMoon(float x, float y) {
  float a = uTheme * PI * 4.0;
  float z = x * cos(a) + y * sin(a);
  float w = y * cos(a) - x * sin(a);
  float r = x * x + y * y - 7.0;
  float b = 9.0 - (w - 2.0) * (w - 2.0) - (z - 1.0) * (z - 1.0);
  return max(r, b);
}

float imp2col(float x) {
  if (x < 0.0) return 1.0 / (1.0 - x) / 3.0;
  return (2.0 + 3.0 * x) / (1.0 + x) / 3.0;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  
  // ボーダー色（light: 黒, dark: 白）
  // theme=0 (light) → 黒 (0), theme=1 (dark) → 白 (1)
  // float dFrame = 1.0 - min(1.0 - abs(uv.x), 1.0 - abs(uv.y)) * 2.0;
  float dFrame = max(abs(uv.x), abs(uv.y)) * 2.0 - 1.0;
  float borderBrightness = dFrame;// * smoothDelta(theme - 1.0);
  vec3 borderColor = vec3(0.0);//vec3(borderBrightness);

  // 内側の色
  uv *= 4.0;
  vec3 innerColor = vec3(imp2col(mix(
    -impMoon(uv.x, uv.y),
    impSun(uv.x, uv.y),
    (1.0 + cos(uTheme * PI)) / 2.0
  )));

  vec3 color = max(borderColor, innerColor);
  // vec3 color = borderColor;
  gl_FragColor = vec4(color, 1.0);
}
`;
