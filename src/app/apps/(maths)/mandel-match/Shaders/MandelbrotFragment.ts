export const mandelbrotFragmentShader = /* glsl */ `
precision mediump float;

uniform vec2 uResolution;
struct Graph {
  vec2 origin;
  float radius;
};
uniform Graph uGraph;
uniform int uMaxIter;
/** 採点フィードバック着色（JS 側で補間済み，既定は (1,1,1)・強度 0） */
uniform vec3 uTintRgb;
uniform float uTintStrength;

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
    vec3 inside = vec3(0.14, 0.14, 0.14);
    inside = mix(inside, inside * uTintRgb, 0.48 * uTintStrength);
    gl_FragColor = vec4(inside, 1.0);
    return;
  }

  float t = clamp(iter / float(uMaxIter), 0.0, 1.0);
  float g = pow(t, 0.42);
  vec3 base = vec3(0.03, 0.03, 0.03);
  vec3 hi = vec3(1.0, 1.0, 1.0);
  vec3 col = mix(base, hi, g);
  col = mix(col, col * uTintRgb, 0.4 * uTintStrength);
  gl_FragColor = vec4(col, 1.0);
}
`;
