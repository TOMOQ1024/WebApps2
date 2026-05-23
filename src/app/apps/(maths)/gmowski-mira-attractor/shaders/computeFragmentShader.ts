export const computeFragmentShader = /* glsl */ `
uniform float alpha;
uniform float sigma;
uniform float mu;

float f(float x) {
  return mu * x + 2.0 * (1.0 - mu) * x * x / (1.0 + x * x);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 prev = texture2D(texturePosition, uv);
  float x = prev.x;
  float y = prev.y;

  float xn1 = y + alpha * (1.0 - sigma * y * y) * y + f(x);
  float yn1 = -x + f(xn1);

  gl_FragColor = vec4(xn1, yn1, 0.0, 1.0);
}
`;
