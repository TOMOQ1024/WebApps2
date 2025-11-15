export const vertexShader = /* glsl */ `
varying vec2 vUv;
uniform sampler2D positionTexture;
uniform float pointSize;

void main() {
  vUv = uv;
  vec4 pos = texture2D(positionTexture, uv);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xy, 0.0, 1.0);
  gl_PointSize = pointSize * 50.0;
}
`;

