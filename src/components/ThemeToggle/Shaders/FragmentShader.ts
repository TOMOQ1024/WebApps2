/**
 * ThemeToggle 用フラグメントシェーダー
 *
 * uniforms:
 * - uTime: 経過時間（秒）
 * - uTheme: [0, 1] の連続値（0: light, 1: dark）
 * - uAspectRatio: アスペクト比（幅/高さ）
 * - uIconScale: アイコンのスケール（0-1、1=画面高さと同じ）
 * - uIconOffset: アイコンの右上からのオフセット（正規化座標）
 *
 * varying:
 * - vUv: [0, 1] に正規化された UV 座標
 */
export const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uTheme;
uniform float uAspectRatio;
uniform float uIconScale;
uniform vec2 uIconOffset;
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
  float aspect = uAspectRatio > 0.0 ? uAspectRatio : 1.0;
  float iconScale = uIconScale > 0.0 ? uIconScale : 1.0;
  vec2 iconOffset = uIconOffset;
  
  // uv を [-1, 1] に変換
  vec2 uv = vUv * 2.0 - 1.0;
  
  // アスペクト比を考慮（x を aspect 倍に拡大）
  uv.x *= aspect;
  
  // アイコンを右上に配置
  // 右上の位置: (aspect - offset.x, 1 - offset.y)
  // アイコンの中心をそこに移動
  vec2 iconCenter = vec2(aspect - iconOffset.x, 1.0 - iconOffset.y);
  
  // アイコン用の UV（アイコン中心を原点に移動し、スケールを適用）
  vec2 uvIcon = (uv - iconCenter) / iconScale;

  // 内側の色（太陽/月のアイコン）
  uvIcon *= 5.0;
  vec3 color = vec3(imp2col(mix(
    impSun(uvIcon.x, uvIcon.y),
    -impMoon(uvIcon.x, uvIcon.y),
    uTheme
  )));
  gl_FragColor = vec4(color, 1.0);
}
`;
