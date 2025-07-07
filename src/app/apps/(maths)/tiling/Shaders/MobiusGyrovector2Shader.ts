export const mobiusGyrovector2Shader = /* glsl */ `
const float PI = 3.14159265359;
const float E = 2.71828182846;


#define WHITE vec4(1., 1., 1., 1.)
#define BLACK vec4(0., 0., 0., 1.)
#define RED   vec4(1., 0., 0., 1.)
#define GREEN vec4(0., 1., 0., 1.)
#define COL_A vec4(.8, 1., 1., 1.)
#define COL_B vec4(.2, .5, 1., 1.)
#define COL_C vec4(.8, .8, 1., 1.)
#define COL_D vec4(1., 1., .7, 1.)
#define COL_E vec4(.7, 1., 1., 1.)
#define LW .02
#define RD 10.
#define MI 50.

#define GNOMONIC_PROJ !true
#define STEREO_PROJ !true
#define DRAW_MIRRORS !true
#define DUAL !true
#define CN  111

#define ma 3.
#define mb 5.
#define mc 2.
#define cv (sign(mb*mc+mc*ma+ma*mb-ma*mb*mc))
#define cr 1.
// #define cr (1./sqrt(abs(cv)))

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
    return cr * acos(x / cr);
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
    return cr * asin(x / cr);
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

vec2 g_add(vec2 p, vec2 q) {
  float k = cv;
  return ((1.f - 2.f * k * dot(p, q) - k * dot(q, q)) * p + (1.f + k * dot(p, p)) * q) / (1.f - 2.f * k * dot(p, q) + k * k * dot(p, p) * dot(q, q));
}

vec2 g_sub(vec2 p, vec2 q) {
  return g_add(-q, p);
}

float g_distance(vec2 p, vec2 q) {
  return 2.f * g_atan(length(g_sub(p, q)));
}

vec2 g_mul(float r, vec2 p) {
  if(r == 0.f || length(p) == 0.f)
    return vec2(0.f, 0.f);
  return g_tan(r * g_atan(length(p))) * normalize(p);
}

vec2 g_rotate(vec2 v, float a) {
  return vec2(v.x * cos(a) - v.y * sin(a), v.y * cos(a) + v.x * sin(a));
}

vec2 g_rotatefrom(vec2 v, vec2 p, float a) {
  return g_add(p, g_rotate(g_sub(v, p), a));
}

float g_angle1(vec2 p) {
  return atan(p.y, p.x);
}

float g_angle2(vec2 p, vec2 q) {
  float s = sign(p.x * q.y - p.y * q.x);
  if(s == 0.f)
    s = 1.f;
  return s * acos(dot(p, q) / length(p) / length(q));
}

float g_angle(vec2 p, vec2 q, vec2 r) {
  return g_angle2(g_sub(p, q), g_sub(r, q));
}

vec2 g_normal(vec2 v) {
  return mat2(0.f, -1.f, 1.f, 0.f) * v;
}

float g_linen(vec2 v, vec2 p, vec2 q) {
  vec2 d = g_sub(v, p);
  return g_asin(2.f * dot(d, q) / (1.f + cv * (d.x * d.x + d.y * d.y)) / length(q));
}

float g_line(vec2 v, vec2 p, vec2 q) {
  if(p == q)
    return 9999.f * distance(v, p);
  return g_linen(v, p, g_normal(g_sub(q, p)));
}

// vec2 g_reflectE(vec2 v, vec2 p, vec2 q) {
//   mat2 m = transpose(mat2(p, q));
//   float k = determinant(m);
//   // vec3 c = adjoint(m) * (vec3(dot(p, p), dot(q, q), dot(r, r)) - 1.f / cv);
//   vec2 c = inverse(m) * k * (vec2(dot(p, p), dot(q, q)) * cv - 1.f);

//   if(k == 0.f) {
//     return v;
//   } else {
//     vec2 d = 2.f * k * cv * v - c;
//     return (c + (4.f * k * k * cv + dot(c, c)) / dot(d, d) * d) / 2.f / k / cv;
//   }
// }

vec2 g_reflect(vec2 v, vec2 p, vec2 q) {
  // return g_reflectE(v,p,q);
  if(abs(g_line(v, p, q)) < 1e-7f)
    return v;
  return g_rotatefrom(v, p, 2.f * g_angle(v, p, q));
}

float g_segment(vec2 v, vec2 p, vec2 q) {
  if(p == q)
    return 9999.f * distance(v, p);
  vec2 tp = g_normal(g_sub(q, p));
  vec2 tq = g_normal(g_sub(p, q));
  return max(abs(g_line(v, p, q)), max(g_line(v, p, g_add(p, tp)), g_line(v, q, g_add(q, tq))));
}

float g_inradius(vec2 p, vec2 q, vec2 r) {
  float qr = g_distance(q, r);
  float rp = g_distance(r, p);
  float pq = g_distance(p, q);
  return g_atan(g_sin((rp + pq - qr) / 2.f) * tan(.5f * g_angle(r, p, q)));
}

vec2 g_incenter(vec2 p, vec2 q, vec2 r) {
  float qr = g_distance(q, r);
  float rp = g_distance(r, p);
  float pq = g_distance(p, q);
  float rd = g_atan(g_sin((rp + pq - qr) / 2.f) * tan(.5f * g_angle(r, p, q)));
  vec2 pqn = g_tan(.5f) * normalize(g_sub(q, p));
  return g_add(g_add(p, g_mul((rp + pq - qr) / 2.f, pqn)), g_mul(rd, g_normal(pqn)));
}

vec2 g_v_2v1e(vec2 P, vec2 Q, float p, float q) {
  float l = g_distance(P, Q);
  float r = acos(-cos(p) * cos(q) + sin(p) * sin(q) * g_cos(l));
  float a = g_angle1(g_sub(Q, P)) + p;
  return g_add(P, g_mul(g_asin(g_sin(l) * sin(q) / sin(r)), g_tan(.5f) * vec2(cos(a), sin(a))));
}

float g_area(vec2 P, vec2 Q, vec2 R) {
  float k = cv;
  if(k == 0.f) {
    float p = g_distance(Q, R);
    float q = g_distance(R, P);
    float r = g_distance(P, Q);
    float s = .5f * (p + q + r);
    return sqrt(s * (s - p) * (s - q) * (s - r));
  }
  return k * (abs(g_angle(R, P, Q) + g_angle(P, Q, R) + g_angle(Q, R, P)) - PI);
}

vec2 g_isodynam(vec2 P, vec2 Q, vec2 R) {
  float k = cv;
  float pp = g_distance(Q, R);
  float qq = g_distance(R, P);
  float rr = g_distance(P, Q);
  pp *= pp;
  qq *= qq;
  rr *= rr;
  float lp = 2.f / (1.f + k * dot(P, P));
  float lq = 2.f / (1.f + k * dot(Q, Q));
  float lr = 2.f / (1.f + k * dot(R, R));
  float s = g_area(P, Q, R);
  float gp = pp * ((pp - qq - rr) * sqrt(3.f) / 4.f - s);
  float gq = qq * ((qq - rr - pp) * sqrt(3.f) / 4.f - s);
  float gr = rr * ((rr - pp - qq) * sqrt(3.f) / 4.f - s);
  float m = gp * (lp - 1.f) + gq * (lq - 1.f) + gr * (lr - 1.f);

  return g_mul(.5f, (gp * lp * P + gq * lq * Q + gr * lr * R) / m);
}

vec2 g_v_oss(vec2 P, vec2 Q, vec2 R) {
  float k = cv;
  float qq = g_distance(R, P);
  float rr = g_distance(P, Q);
  float q = g_angle(P, Q, R);
  float r = g_angle(Q, R, P);
  float lp = 2.f / (1.f + k * dot(P, P));
  float lq = 2.f / (1.f + k * dot(Q, Q));
  float lr = 2.f / (1.f + k * dot(R, R));
  float gp = 0.f;
  float gq = sin(2.f * q);
  float gr = sin(2.f * r);
  float m = gp * (lp - 1.f) + gq * (lq - 1.f) + gr * (lr - 1.f);

  return g_mul(.5f, (gp * lp * P + gq * lq * Q + gr * lr * R) / m);
}

vec2 g_mean3(vec2 P, vec2 Q, vec2 R) {
  float k = cv;
  float lp = 2.f / (1.f + k * dot(P, P));
  float lq = 2.f / (1.f + k * dot(Q, Q));
  float lr = 2.f / (1.f + k * dot(R, R));
  float m = lp + lq + lr - 3.f;

  return g_mul(.5f, (lp * P + lq * Q + lr * R) / m);
}
`;
