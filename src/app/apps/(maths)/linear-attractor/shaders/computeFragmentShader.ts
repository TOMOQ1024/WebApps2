export const computeFragmentShader = /* glsl */ `
uniform float uTime;
// 確率の閾値
uniform float uThreshold0;
uniform float uThreshold1;
uniform float uThreshold2;
uniform float uThreshold3;
// アフィン変換の行列
uniform mat4 uTransform0;
uniform mat4 uTransform1;
uniform mat4 uTransform2;
uniform mat4 uTransform3;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 prev = texture2D(texturePosition, uv);
  vec4 v;

  float r = random(uv + uTime) * (uThreshold0 + uThreshold1 + uThreshold2 + uThreshold3);

  if ((r -= uThreshold0) < 0.0) {
    v = uTransform0 * prev;
  } else if ((r -= uThreshold1) < 0.0) {
    v = uTransform1 * prev;
  } else if ((r -= uThreshold2) < 0.0) {
    v = uTransform2 * prev;
  } else {
    v = uTransform3 * prev;
  }

  gl_FragColor = v;
}
`;
