uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;
attribute vec4 color;
uniform float time;

varying vec2 vUv;
varying vec4 vColor;
varying vec3 vDepth;

vec3 g_add(vec3 p, vec3 q) {
  float pp = dot(p, p);
  float pq = dot(p, q);
  float qq = dot(q, q);
  return ((1. - 2. * pq - qq) * p + (1. + pp) * q) / (1. - 2. * pq + pp * qq);
}

vec3 g_sub(vec3 p, vec3 q) {
  return g_add(-q, p);
}

vec3 g_mul(float r, vec3 p) {
  if(r == 0.0 || length(p) == 0.0)
    return vec3(0.0);
  return normalize(p) * tan(r * atan(length(p)));
}

void main() {
  vec3 origin = vec3(0., 0., 0.);
  // vec3 origin = g_mul(time, vec3(0., 0., .1));
  vec3 S = g_add(origin, position);
  float l = 1.;
  vec3 P = S * l / (dot(S, S) * (l - 1.) + l);
  vDepth = -(modelViewMatrix * vec4(P.xyz, 1.)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(P.xyz, 1.0);
  vUv = uv;
  vColor = color;
}
