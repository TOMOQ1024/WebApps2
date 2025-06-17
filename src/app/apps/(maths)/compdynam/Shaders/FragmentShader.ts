import { complexFunctionShader } from "./ComplexFunctionShader";

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

${complexFunctionShader}

vec3 hsv2rgb(float h, float s, float v) {
  return ((clamp(abs(fract(h + vec3(0, 2, 1) / 3.) * 6. - 3.) - 1., 0., 1.) - 1.) * s + 1.) * v;
  // return ((clamp(abs(fract(h+vec4(0.,2.,1.,1.)/3.)*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;
}

vec2 compdynam(vec2 C) {
  vec2 t = vec2(uTime, 0.);
  vec2 c = vec2(C);
  vec2 z = c/* input initial value here */;

  for(int i = 0; i < uIterations; i++) {
    z = z/* input func here */;
    // if (40. < abs(log(length(z)))) break;
  }
  return z;
}

void main() {
  vec2 z0 = vPosition / min(uResolution.x, uResolution.y) * uGraph.radius + uGraph.origin;
  vec2 a = compdynam(z0);

  switch(uRenderMode) {
    case 0:/* hsv */
      {
        float b = a.x != 0. ? atan(a.y, a.x) : a.y < 0. ? -PI / 2. : PI / 2.;
        gl_FragColor = vec4(hsv2rgb(b / 2. / PI + 1., 1., pow(1. / (1. + length(a)), .1)), 1.);
        break;
      }
    case 1:/* grayscale */
      {
        float b = a.x != 0. ? atan(a.y, a.x) : a.y < 0. ? -PI / 2. : PI / 2.;
        gl_FragColor = vec4(hsv2rgb(0., 0., pow(1. / (1. + length(a)), .1) * (1. + sin(b * 2.)) / 2.), 1.);
        break;
      }
    case 2:/* image */
      {
        vec2 A0 = (a * 2. + 1.) / 2.;
        gl_FragColor = length(a) < 1e20 ? texture2D(uTexture, vec2(A0.x, -A0.y)) : vec4(0., 0., 0., 1.);
        break;
      }
  }
}
`;
