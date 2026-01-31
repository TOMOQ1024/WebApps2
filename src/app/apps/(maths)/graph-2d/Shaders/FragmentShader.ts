import { mathFunctionShader } from "./MathFunctionShader";

export const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uTime;
uniform float uTheme; // 0: light, 1: dark
uniform vec2 uResolution;
struct Graph {
  vec2 origin;
  float radius;
};
uniform Graph uGraph;
uniform sampler2D uTexture;
uniform int uRenderMode;  // 0: 不等式白黒, 1: clamp(-1~1), 2: tanh
uniform int uExprType;    // 0: 不等式, 1: 数値式
uniform int uIterations;
varying vec2 vPosition;

${mathFunctionShader}

float graph2d(vec2 _C) {
  float t = uTime;
  float x = _C.x;
  float y = _C.y;
  float c;

  /* input func here */

  return c;
}

float smooth01(float x) {
  return x * x * (3.0 - 2.0 * x);
}

void main() {
  vec2 z0 = vPosition / min(uResolution.x, uResolution.y) * uGraph.radius + uGraph.origin;
  float c = graph2d(z0);
  float t = smooth01(uTheme);
  float color;

  if (uExprType == 0) {
    // 不等式モード（白黒）
    // 不等式成立時 (c < 0): dark=white, light=black → color = uTheme
    // 不等式不成立時: dark=black, light=white → color = 1 - uTheme
    float satisfied = c < 0. ? 1. : 0.;
    color = mix(1. - t, t, satisfied);
  } else {
    // 数値式モード（グレースケール）
    float normalized;
    if (uRenderMode == 1) {
      // clamp モード: -1〜1 にクランプ
      normalized = clamp(c, -1., 1.) * 0.5 + 0.5;
    } else {
      // tanh モード: tanh で -1〜1 に変換
      normalized = tanh(c) * 0.5 + 0.5;
    }
    // テーマに応じて反転（ライトモードでは値が大きいほど黒、ダークモードでは白）
    color = mix(1. - normalized, normalized, t);
  }

  gl_FragColor = vec4(color, color, color, 1.);
}
`;
