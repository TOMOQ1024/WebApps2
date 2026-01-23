export const defaultFragmentShader = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

void main() {
  gl_FragColor = vec4(vUv, 0.5 + 0.5 * sin(uTime), 1.0);
}
`;
