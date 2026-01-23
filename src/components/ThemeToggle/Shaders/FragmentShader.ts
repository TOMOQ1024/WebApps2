// TODO: カスタムシェーダーを実装
export const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uTheme; // 0: auto, 1: light, 2: dark
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.5;
  
  // ボーダー判定（2px / 32px = 0.0625）
  float borderWidth = 0.0625;
  bool isBorder = uv.x < borderWidth || uv.x > 1.0 - borderWidth ||
                  uv.y < borderWidth || uv.y > 1.0 - borderWidth;
  
  // テーマに応じた色
  vec3 bgColor;
  vec3 borderColor;
  
  if (uTheme > 1.5) {
    // dark
    bgColor = vec3(0.0);
    borderColor = vec3(1.0);
  } else if (uTheme > 0.5) {
    // light
    bgColor = vec3(1.0);
    borderColor = vec3(0.0);
  } else {
    // auto - アニメーション
    float wave = 0.5 + 0.5 * sin(t + length(uv - 0.5) * 10.0);
    bgColor = vec3(wave);
    borderColor = vec3(0.5);
  }
  
  vec3 color = isBorder ? borderColor : bgColor;
  gl_FragColor = vec4(color, 1.0);
}
`;
