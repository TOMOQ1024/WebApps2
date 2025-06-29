import { mathFunctionShader } from "./MathFunctionShader";

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

${mathFunctionShader}

float graph2d(vec2 C) {
  float t = uTime;
  float x = C.x;
  float y = C.y;
  float c;

  /* input func here */

  return c;
}

void main() {
  vec2 z0 = vPosition / min(uResolution.x, uResolution.y) * uGraph.radius + uGraph.origin;
  float c = graph2d(z0);

  c = c < 0. ? 0. : 1.;

  gl_FragColor = vec4(c, c, c, 1.);
  return;

  switch(uRenderMode) {
    case 0:/* sign */
      {
        break;
      }
    case 1:/* grayscale */
      {
        break;
      }
  }
}
`;
