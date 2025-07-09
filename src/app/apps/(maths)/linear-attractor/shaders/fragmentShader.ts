export const fragmentShader = /* glsl */ `
varying vec2 vUv;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(0.0, 0.94, 1.0, 1.0);
}
`;
