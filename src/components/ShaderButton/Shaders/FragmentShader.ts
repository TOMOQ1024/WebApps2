/**
 * ShaderButton 用のサンプルフラグメントシェーダー
 *
 * 利用可能な uniforms:
 * - uTime: 経過時間（秒）
 *
 * 利用可能な varying:
 * - vUv: [0, 1] に正規化された UV 座標
 *
 * ボーダーを描画する場合:
 * - uBorderWidth を追加し、UV 座標で判定（例: 2px / 32px = 0.0625）
 */
export const fragmentShader = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

void main() {
  // サンプル: UV 座標に基づく色
  gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
}
`;
