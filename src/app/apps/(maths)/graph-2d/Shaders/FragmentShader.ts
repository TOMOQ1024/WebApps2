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
uniform int uRenderMode;
uniform int uIterations;
varying vec2 vPosition;

${mathFunctionShader}

float graph2d(vec2 C) {
  float t = uTime;
  float x = C.x;
  float y = C.y;
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

  // 不等式成立時 (c < 0): dark=white, light=black → color = uTheme
  // 不等式不成立時: dark=black, light=white → color = 1 - uTheme
  float satisfied = c < 0. ? 1. : 0.;
  float t = smooth01(uTheme);
  float color = mix(1. - t, t, satisfied);

  gl_FragColor = vec4(color, color, color, 1.);
}
`;
