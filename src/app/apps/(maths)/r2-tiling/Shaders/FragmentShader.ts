import { mobiusGyrovector2Shader } from "./MobiusGyrovector2";

export const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uTime;
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

${mobiusGyrovector2Shader}

void main() {
  vec2 v0 = vPosition / min(uResolution.x, uResolution.y) * uGraph.radius + uGraph.origin;

}
`;
