export const mandelbrotFragmentShader = /* glsl */ `
precision mediump float;

uniform vec2 uResolution;
struct Graph {
  vec2 origin;
  float radius;
};
uniform Graph uGraph;
uniform int uMaxIter;

varying vec2 vPosition;

void main() {
  float m = min(uResolution.x, uResolution.y);
  vec2 c = vPosition / m * uGraph.radius + uGraph.origin;

  vec2 z = vec2(0.0);
  float iter = 0.0;
  bool escaped = false;

  for (int i = 0; i < 512; i++) {
    if (i >= uMaxIter) {
      break;
    }
    if (dot(z, z) > 4.0) {
      float zn = length(z);
      iter = float(i) + 1.0 - log2(log2(max(zn, 1e-6)));
      escaped = true;
      break;
    }
    z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * z.x * z.y + c.y);
  }

  if (!escaped) {
    gl_FragColor = vec4(0.14, 0.14, 0.16, 1.0);
    return;
  }

  float t = clamp(iter / float(uMaxIter), 0.0, 1.0);
  float g = pow(t, 0.42);
  vec3 base = vec3(0.03, 0.03, 0.03);
  vec3 hi = vec3(1.0, 1.0, 1.0);
  vec3 col = mix(base, hi, g);
  gl_FragColor = vec4(col, 1.0);
}
`;
