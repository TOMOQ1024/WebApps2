/**
 * ThemeToggle 用フラグメントシェーダー
 *
 * uniforms:
 * - uTime: 経過時間（秒）
 * - uTheme: [0, 2) の連続値（0-1: light, 1-2: dark）
 * - uBorderWidth: 正規化されたボーダー幅（0-1）
 *
 * varying:
 * - vUv: [0, 1] に正規化された UV 座標
 */
export const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uTheme;
uniform float uBorderWidth;
varying vec2 vUv;

float smoothDelta(float x) {
  return pow(2.0, 1.0 / (x * x + 1.0)) - 1.0;
}

void main() {
  vec2 uv = vUv;
  float theme = mod(uTheme, 2.0);
  
  // ボーダー判定（UV 座標）
  float bw = uBorderWidth;
  bool isBorder = uv.x < bw || uv.x > 1.0 - bw || 
                  uv.y < bw || uv.y > 1.0 - bw;
  
  // ボーダー色（light: 黒, dark: 白）
  // theme=0 (light) → 黒 (0), theme=1 (dark) → 白 (1)
  float borderBrightness = smoothDelta(theme - 1.0);
  vec3 borderColor = vec3(borderBrightness);
  
  // 内側の色
  vec3 innerColor = vec3(
    max(smoothDelta(theme - 0.0), smoothDelta(theme - 2.0)), 
    smoothDelta(theme - 1.0),
    0.0
  );
  
  vec3 color = isBorder ? borderColor : innerColor;
  gl_FragColor = vec4(color, 1.0);
}
`;
