export const vertexShader = /* glsl */ `
precision mediump float;
varying vec2 vPosition;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vPosition = position.xy;
}
`;
