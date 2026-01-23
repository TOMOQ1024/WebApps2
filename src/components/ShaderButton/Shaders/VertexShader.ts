/**
 * ShaderButton 用の標準頂点シェーダー
 * projectionMatrix と modelViewMatrix を使用して、カメラに従って配置
 */
export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
