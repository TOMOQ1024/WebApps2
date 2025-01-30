#version 300 es
precision lowp float;

in vec2 vTexCoord;
in vec2 vPosition;
out vec4 finalColor;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

#define MAX_STEPS 20
#define MAX_DIST 20.
#define SURF_DIST 1e-9

#define PI 3.14159265358979

const float cv = -1.f;
const float cr = 1.f;

mat3 adjoint(mat3 m) {
  return mat3(m[1][1] * m[2][2] - m[2][1] * m[1][2], m[0][2] * m[2][1] - m[0][1] * m[2][2], m[0][1] * m[1][2] - m[0][2] * m[1][1], m[1][2] * m[2][0] - m[1][0] * m[2][2], m[0][0] * m[2][2] - m[0][2] * m[2][0], m[1][0] * m[0][2] - m[0][0] * m[1][2], m[1][0] * m[2][1] - m[2][0] * m[1][1], m[2][0] * m[0][1] - m[0][0] * m[2][1], m[0][0] * m[1][1] - m[1][0] * m[0][1]);
}

float g_cos(float x) {
  if(cv < 0.f)
    return cr * cosh(x / cr);
  if(cv > 0.f)
    return cr * cos(x / cr);
  return 1.f;
}

float g_acos(float x) {
  if(cv < 0.f)
    return cr * acosh(x / cr);
  if(cv > 0.f)
    return cr * acos(clamp(-1.f, x / cr, 1.f));
  return x;
}

float g_sin(float x) {
  if(cv < 0.f)
    return cr * sinh(x / cr);
  if(cv > 0.f)
    return cr * sin(x / cr);
  return x;
}

float g_asin(float x) {
  if(cv < 0.f)
    return cr * asinh(x / cr);
  if(cv > 0.f)
    return cr * asin(clamp(-1.f, x / cr, 1.f));
  return x;
}

float g_tan(float x) {
  if(cv < 0.f)
    return cr * tanh(x / cr);
  if(cv > 0.f)
    return cr * tan(x / cr);
  return x;
}

float g_atan(float x) {
  if(cv < 0.f)
    return cr * atanh(x / cr);
  if(cv > 0.f)
    return cr * atan(x / cr);
  return x;
}

vec3 g_add(vec3 p, vec3 q) {
  float k = cv;
  return ((1.f - 2.f * k * dot(p, q) - k * dot(q, q)) * p + (1.f + k * dot(p, p)) * q) / (1.f - 2.f * k * dot(p, q) + k * k * dot(p, p) * dot(q, q));
}

vec3 g_sub(vec3 p, vec3 q) {
  return g_add(-q, p);
}

float g_length(vec3 p) {
  return 2.f * g_atan(length(p));
}

float g_distance(vec3 p, vec3 q) {
  return 2.f * g_atan(length(g_sub(p, q)));
}

vec3 g_mul(float r, vec3 p) {
  if(r == 0.f || length(p) == 0.f)
    return vec3(0);
  return g_tan(r * g_atan(length(p))) * normalize(p);
}

float g_planen(vec3 v, vec3 p, vec3 q) {
  vec3 d = g_sub(v, p);
  return g_asin(2.f * dot(d, q) / (1.f + cv * dot(d, d)) / length(q));
}

float g_plane(vec3 v, vec3 p, vec3 q, vec3 r) {
  if(p == q || q == r || r == p)
    return 9999.f * distance(v, p);
  return g_planen(v, p, cross(g_sub(q, p), g_sub(r, p)));
}

float g_planeE(vec3 v, vec3 p, vec3 q, vec3 r) {
  mat3 m = transpose(mat3(p, q, r));
  float k = determinant(m);
  vec3 c = adjoint(m) * (vec3(dot(p, p), dot(q, q), dot(r, r)) * cv - 1.f);
  // vec3 c = inverse(m) * k * (vec3(dot(p, p), dot(q, q), dot(r, r)) * cv - 1.f);

  vec3 a = 2.f * k * cv * v - c;
  return cv * (dot(a, a) - dot(c, c) - 4.f * k * k * cv);
}

vec3 g_reflect(vec3 v, vec3 p, vec3 q, vec3 r) {
  mat3 m = transpose(mat3(p, q, r));
  float k = determinant(m);
  vec3 c = adjoint(m) * (vec3(dot(p, p), dot(q, q), dot(r, r)) * cv - 1.f);
  // vec3 c = inverse(m) * k * (vec3(dot(p, p), dot(q, q), dot(r, r)) * cv - 1.f);

  if(k == 0.f) {
    return v - 2.f * dot(v, c) * c / dot(c, c);
  } else {
    vec3 d = 2.f * k * cv * v - c;
    return (c + (4.f * k * k * cv + dot(c, c)) / dot(d, d) * d) / 2.f / k / cv;
  }
}

vec3 g_mean3(vec3 P, vec3 Q, vec3 R) {
  float k = cv;
  float lp = 2.f / (1.f + k * dot(P, P));
  float lq = 2.f / (1.f + k * dot(Q, Q));
  float lr = 2.f / (1.f + k * dot(R, R));
  float m = lp + lq + lr - 3.f;

  return g_mul(.5f, (lp * P + lq * Q + lr * R) / m);
}

vec3 g_antipode(vec3 v) {
  return g_mul(g_length(v) - PI * cr, g_tan(.5f) * normalize(v));
}

vec3 g_mean4(vec3 P, vec3 Q, vec3 R, vec3 S) {
  float k = cv;
  float lp = 2.f / (1.f + k * dot(P, P));
  float lq = 2.f / (1.f + k * dot(Q, Q));
  float lr = 2.f / (1.f + k * dot(R, R));
  float ls = 2.f / (1.f + k * dot(S, S));
  float m = lp + lq + lr + ls - 4.f;

  vec3 a = g_mul(.5f, (lp * P + lq * Q + lr * R + ls * S) / m);
  vec3 b = g_antipode(a);
  if(g_distance(P, a) < g_distance(P, b))
    return a;
  return b;
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdCylinder(vec3 v, vec3 p, vec3 q, vec3 r, float s) {
  float l = (1.f + cv * dot(v, v)) / 2.f;
  float a = g_plane(v, p, q, r);
  float b = g_plane(v, p, q, g_add(p, cross(g_sub(q, p), g_sub(r, p))));

  // g_{sub}\left(\left(x,y,z\right),A\right)\cdot g_{sub}\left(A_{A},A\right)
  float c = -dot(g_sub(v, p), g_sub(q, p));
  float d = -dot(g_sub(v, q), g_sub(p, q));

  return max(max(c, d), l * l * (a * a + b * b) - s);
}

float getDist(vec3 p) {
  float t = uTime * .5f;
  vec3 A = vec3(-0.1f);
  vec3 B = vec3(.9f, 0, 0);
  vec3 C = vec3(0, .9f * cos(t), .9f * sin(t));
  vec3 D = vec3(0, .9f * sin(t), -.9f * cos(t));

  for(int i = 0; i < 30; i++) {
    if(g_planeE(p, B, C, D) > 0.f)
      p = g_reflect(p, B, C, D);
    else if(g_planeE(p, C, D, A) > 0.f)
      p = g_reflect(p, C, D, A);
    else if(g_planeE(p, D, A, B) > 0.f)
      p = g_reflect(p, D, A, B);
    else if(g_planeE(p, A, B, C) > 0.f)
      p = g_reflect(p, A, B, C);
    else
      break;
  }

  float d = 999.f;
  vec3 Q = g_mean4(A, B, C, D);
  // d = sdSphere(p - Q, 2e-2f);
  float r = 1e-1f;
  d = min(d, g_distance(p, A) - r);
  d = min(d, g_distance(p, B) - r);
  d = min(d, g_distance(p, C) - r);
  d = min(d, g_distance(p, D) - r);

  // vec3 Qa = g_reflect(Q,B,C,D);
  // d = min(d,sdSphere(p - Qa, 2e-2f));
  // vec3 Qb = g_reflect(Q,C,D,A);
  // d = min(d,sdSphere(p - Qb, 2e-2f));
  // d = min(d, sdCylinder(p, A, B, C, -4e-3f));
  // d = min(d, sdCylinder(p, B, C, D, -4e-3f));
  // d = min(d, length(cross(g_sub(p, B), normalize(g_sub(C, B)))) - .001f);
  // d = min(d, length(cross(g_sub(p, C), normalize(g_sub(D, C)))) - .001f);
  // d = min(d, length(cross(g_sub(p, D), normalize(g_sub(A, D)))) - .001f);
  // d = min(d, length(cross(g_sub(p, A), normalize(g_sub(C, A)))) - .001f);
  // d = min(d, length(cross(g_sub(p, B), normalize(g_sub(D, B)))) - .001f);
  return d;
}

float rayMarch(vec3 ro, vec3 rd) {
  float dO = 0.f;

  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = g_add(ro, g_mul(dO, rd));
    float dS = getDist(p);
    dO += dS;
    if(dO > MAX_DIST || dS < SURF_DIST)
      break;
  }

  return dO;
}

void main() {
  vec2 uv = (vPosition - .5f) * 2.f;
  if(max(abs(uv.x), abs(uv.y)) > .99f) {
    finalColor = vec4(1.f, 1.f, 1.f, 1.f);
    return;
  }
  if(max(abs(uv.x), abs(uv.y)) > .85f) {
    finalColor = vec4(.2f, .2f, .2f, 1.f);
    return;
  }

  vec3 col = vec3(0);

  vec3 ro = vec3(.1f, .2f, .3f);
  vec3 rd = g_tan(.5f) * normalize(vec3(uv.x + uMouse.x / uResolution.x * 8.f - 4.f, uv.y + uMouse.y / uResolution.y * 8.f - 4.f, .0f) - ro);

  float d = rayMarch(ro, rd);
  mat3 G = mat3(.3f, .3f, .3f, .3f, .3f, .3f, .3f, .3f, .3f);

  if(d < MAX_DIST) {
    // vec3 p = g_add(ro,g_mul(d,rd));

    float dif = 1.f - d / MAX_DIST * 6.f;
    // 	col = normalize(p)/2.+.5;
    col = vec3(1.f, 1.f, 1.f);
    col *= dif + .3f;
    // if(sdFaces(p) < 2e-3) col = G*col * .8;
  }

  // col = pow(col, vec3(.4545));	// gamma correction

  finalColor = vec4(col, 1.0f);
}
