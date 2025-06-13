export const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec2 vPosition;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
