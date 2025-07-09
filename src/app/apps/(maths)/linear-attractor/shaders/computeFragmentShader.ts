export const computeFragmentShader = /* glsl */ `
uniform float uTime;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 prev = texture2D(texturePosition, uv);
  vec4 v;

  float r = random(uv + uTime);

  if (r < 1./4.) {
    v = mix(prev, vec4(+1., +1., +1., 1.), 0.5);
  } else if (r < 2./4.) {
    v = mix(prev, vec4(-1., -1., +1., 1.), 0.5);
  } else if (r < 3./4.) {
    v = mix(prev, vec4(+1., -1., -1., 1.), 0.5);
  } else {
    v = mix(prev, vec4(-1., +1., -1., 1.), 0.5);
  }

  gl_FragColor = v;
}
`;
