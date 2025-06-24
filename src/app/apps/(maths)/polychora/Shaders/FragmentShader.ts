export const fragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec4 vColor;
varying vec3 vDepth;
#define PI 3.14159265358979323846

float tanh(float x) {
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

vec4 tanh(vec4 x) {
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

void main() {
  float e = .2;
  vec4 t = vColor - 1. + e;
  // float r = min(abs(t.x), min(abs(t.y), abs(t.z)));
  // vec4 c = mix(vec4(0.), 1. - e + e * sign(t), r/.1);
  vec4 c = 1. - e + e * tanh(30. * t);
  // vec4 c = pow(vColor, vec4(3.));
  float d = tanh(vDepth.z);
  float alpha = (3. - d) / 4.;
  gl_FragColor = vec4(c.rgb * alpha, alpha);
}
`;
