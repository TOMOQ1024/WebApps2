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

#define PI 3.14159265358979

#define WHITE vec4(1., 1., 1., 1.)
#define BLACK vec4(0., 0., 0., 1.)
#define RED   vec4(1., 0., 0., 1.)
#define GREEN vec4(0., 1., 0., 1.)
#define COL_A vec4(1., .8, .8, 1.)
#define COL_B vec4(.8, 1., .8, 1.)
#define COL_C vec4(.8, .8, 1., 1.)
#define COL_D vec4(1., 1., .7, 1.)
#define COL_E vec4(.7, 1., 1., 1.)
#define LW .01
#define RD 1.
#define MI 30.

#define STEREO_PROJ true
#define DRAW_MIRRORS true
#define DUAL !true
#define CN   222

#define ma 2.
#define mb 3.
#define mc 5.
#define cv (sign(mb*mc+mc*ma+ma*mb-ma*mb*mc))
#define cr 1.
// #define cr (1./sqrt(abs(cv)))

float cosh(float x) {
  return (exp(x) + exp(-x)) / 2.;
}

float acosh(float x) {
  return log(x + sqrt(x + 1.) * sqrt(x - 1.));
}

float sinh(float x) {
  return (exp(x) - exp(-x)) / 2.;
}

float asinh(float x) {
  return log(x + sqrt(x * x + 1.));
}

float tanh(float x) {
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

float atanh(float x) {
  return .5 * log((1. + x) / (1. - x));
}

float g_cos(float x) {
  if(cv < 0.)
    return cr * cosh(x / cr);
  if(cv > 0.)
    return cr * cos(x / cr);
  return 1.;
}

float g_acos(float x) {
  if(cv < 0.)
    return cr * acosh(x / cr);
  if(cv > 0.)
    return cr * acos(x / cr);
  return x;
}

float g_sin(float x) {
  if(cv < 0.)
    return cr * sinh(x / cr);
  if(cv > 0.)
    return cr * sin(x / cr);
  return x;
}

float g_asin(float x) {
  if(cv < 0.)
    return cr * asinh(x / cr);
  if(cv > 0.)
    return cr * asin(x / cr);
  return x;
}

float g_tan(float x) {
  if(cv < 0.)
    return cr * tanh(x / cr);
  if(cv > 0.)
    return cr * tan(x / cr);
  return x;
}

float g_atan(float x) {
  if(cv < 0.)
    return cr * atanh(x / cr);
  if(cv > 0.)
    return cr * atan(x / cr);
  return x;
}

vec2 g_add(vec2 p, vec2 q) {
  float k = cv;
  return ((1. - 2. * k * dot(p, q) - k * dot(q, q)) * p + (1. + k * dot(p, p)) * q) / (1. - 2. * k * dot(p, q) + k * k * dot(p, p) * dot(q, q));
}

vec2 g_sub(vec2 p, vec2 q) {
  return g_add(-q, p);
}

float g_distance(vec2 p, vec2 q) {
  return 2. * g_atan(length(g_sub(p, q)));
}

vec2 g_mul(float r, vec2 p) {
  if(r == 0. || length(p) == 0.)
    return vec2(0., 0.);
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
  if(s == 0.)
    s = 1.;
  return s * acos(dot(p, q) / length(p) / length(q));
}

float g_angle(vec2 p, vec2 q, vec2 r) {
  return g_angle2(g_sub(p, q), g_sub(r, q));
}

vec2 g_normal(vec2 v) {
  return mat2(0., -1., 1., 0.) * v;
}

float g_linen(vec2 v, vec2 p, vec2 q) {
  vec2 d = g_sub(v, p);
  return g_asin(2. * dot(d, q) / (1. + cv * (d.x * d.x + d.y * d.y)) / length(q));
}

float g_line(vec2 v, vec2 p, vec2 q) {
  if(p == q)
    return 9999. * distance(v, p);
  return g_linen(v, p, g_normal(g_sub(q, p)));
}

vec2 g_reflect(vec2 v, vec2 p, vec2 q) {
  if(abs(g_line(v, p, q)) < 1e-6)
    return v;
  return g_rotatefrom(v, p, 2. * g_angle(v, p, q));
}

float g_segment(vec2 v, vec2 p, vec2 q) {
  if(p == q)
    return 9999. * distance(v, p);
  vec2 tp = g_normal(g_sub(q, p));
  vec2 tq = g_normal(g_sub(p, q));
  return max(abs(g_line(v, p, q)), max(g_line(v, p, g_add(p, tp)), g_line(v, q, g_add(q, tq))));
}

float g_inradius(vec2 p, vec2 q, vec2 r) {
  float qr = g_distance(q, r);
  float rp = g_distance(r, p);
  float pq = g_distance(p, q);
  return g_atan(g_sin((rp + pq - qr) / 2.) * tan(.5 * g_angle(r, p, q)));
}

vec2 g_incenter(vec2 p, vec2 q, vec2 r) {
  float qr = g_distance(q, r);
  float rp = g_distance(r, p);
  float pq = g_distance(p, q);
  float rd = g_atan(g_sin((rp + pq - qr) / 2.) * tan(.5 * g_angle(r, p, q)));
  vec2 pqn = g_tan(.5) * normalize(g_sub(q, p));
  return g_add(g_add(p, g_mul((rp + pq - qr) / 2., pqn)), g_mul(rd, g_normal(pqn)));
}

vec2 g_v_2v1e(vec2 P, vec2 Q, float p, float q) {
  float l = g_distance(P, Q);
  float r = acos(-cos(p) * cos(q) + sin(p) * sin(q) * g_cos(l));
  float a = g_angle1(g_sub(Q, P)) + p;
  return g_add(P, g_mul(g_asin(g_sin(l) * sin(q) / sin(r)), g_tan(.5) * vec2(cos(a), sin(a))));
}

float g_area(vec2 P, vec2 Q, vec2 R) {
  float k = cv;
  if(k == 0.) {
    float p = g_distance(Q, R);
    float q = g_distance(R, P);
    float r = g_distance(P, Q);
    float s = .5 * (p + q + r);
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
  float lp = 2. / (1. + k * dot(P, P));
  float lq = 2. / (1. + k * dot(Q, Q));
  float lr = 2. / (1. + k * dot(R, R));
  float s = g_area(P, Q, R);
  float gp = pp * ((pp - qq - rr) * sqrt(3.) / 4. - s);
  float gq = qq * ((qq - rr - pp) * sqrt(3.) / 4. - s);
  float gr = rr * ((rr - pp - qq) * sqrt(3.) / 4. - s);
  float m = gp * (lp - 1.) + gq * (lq - 1.) + gr * (lr - 1.);

  return g_mul(.5, (gp * lp * P + gq * lq * Q + gr * lr * R) / m);
}

vec2 g_v_oss(vec2 P, vec2 Q, vec2 R) {
  float k = cv;
  float qq = g_distance(R, P);
  float rr = g_distance(P, Q);
  float q = g_angle(P, Q, R);
  float r = g_angle(Q, R, P);
  float lp = 2. / (1. + k * dot(P, P));
  float lq = 2. / (1. + k * dot(Q, Q));
  float lr = 2. / (1. + k * dot(R, R));
  float gp = 0.;
  float gq = sin(2. * q);
  float gr = sin(2. * r);
  float m = gp * (lp - 1.) + gq * (lq - 1.) + gr * (lr - 1.);

  return g_mul(.5, (gp * lp * P + gq * lq * Q + gr * lr * R) / m);
}

vec2 g_mean3(vec2 P, vec2 Q, vec2 R) {
  float k = cv;
  float lp = 2. / (1. + k * dot(P, P));
  float lq = 2. / (1. + k * dot(Q, Q));
  float lr = 2. / (1. + k * dot(R, R));
  float m = lp + lq + lr - 3.;

  return g_mul(.5, (lp * P + lq * Q + lr * R) / m);
}

// \frac{A\sin2\alpha+B\sin2\beta}{\sin2\alpha+\sin2\beta}

void main() {
  finalColor = WHITE;
  vec2 P = RD * mat2(1., 0., 0., -1.) * (vPosition * 2. - 1.);

  float a = PI / ma;
  float b = PI / mb;
  float c = PI / mc;
  float BC = g_acos((cos(a) + cos(b) * cos(c)) / (sin(b) * sin(c)));
  float CA = g_asin(g_sin(BC) * sin(b) / sin(a));
  float AB = g_asin(g_sin(BC) * sin(c) / sin(a));
  vec2 A = vec2(0., 0.);
  vec2 B = g_mul(AB, vec2(g_tan(.5), 0.));
  vec2 C = g_mul(CA, g_tan(.5) * vec2(cos(a), sin(a)));

  // 線分のデバッグ
  vec2 M = RD * mat2(1., 0., 0., -1.) * (uMouse / uResolution * 2. - 1.);
  // if(LW > g_segment(P, M, M)) {
  //   finalColor = GREEN;
  //   return;
  // }
  // if(LW > abs(g_line(P, M, M))) {
  //   finalColor = RED;
  //   return;
  // }

  // 投影
  if(STEREO_PROJ) {
    if(cv > 0.) {
      if(length(P) > 1.)
        return;
      P = normalize(P) * length(P) / (1. + sqrt(1. - dot(P, P)));
      M = .5 * vec2(cos(uTime), sin(uTime));
    }
    if(cv < 0.) {
      // if(length(P) > 1.)return;
      P = normalize(P) * length(P) / (1. + sqrt(1. + dot(P, P)));
      M = .5 * vec2(cos(uTime / 2.), sin(uTime / 2.));
    }
    A = g_sub(A, M);
    B = g_sub(B, M);
    C = g_sub(C, M);
  }

  // 円の描画
  // if(LW / 4. > abs(length(P) - 1.)) {
  //   finalColor = vec4(0., 0., 1., 1.);
  //   return;
  // }

  // if(cv < 0. && length(P) > 1.) {
  //   return;
  // }

  float i, ia, ib, ic;
  for(float _i = 0.; _i < MI; _i++) {
    i = _i;
    if(0. < g_line(P, B, C)) {
      P = g_reflect(P, B, C);
      ++ia;
    } else if(0. < g_line(P, C, A)) {
      P = g_reflect(P, C, A);
      ++ib;
    } else if(0. < g_line(P, A, B)) {
      P = g_reflect(P, A, B);
      ++ic;
    } else
      break;
  }

  // 鏡面の描画
  if(DRAW_MIRRORS && (LW / 8. > g_segment(P, B, C) ||
    LW / 8. > g_segment(P, C, A) ||
    LW / 8. > g_segment(P, A, B))) {
    finalColor = GREEN;
    return;
  }

  // 内接円の描画
  // if(LW / 2. > abs(g_distance(P, g_incenter(A, B, C)) + g_inradius(A, B, C))) {
  //   finalColor = vec4(0., 0., 1., 1.);
  //   return;
  // }

  // vec2 q = incenter(a,b,c);
  // vec2 q = isodynam(a, b, c);

  // finalColor = vec4(1., 0., 1., 1.);

  // vec2 Q = g_v_2v1e(A, B, .5*a, b);
  // vec2 Q = g_v_2v1e(B, C, b, .5 * c);
  if(DUAL) {
    finalColor = COL_A;
    if(CN == 1) {
      if(LW > g_segment(P, A, B)) {
        finalColor = BLACK;
      }
    }
    if(CN == 11) {
      if(LW > g_segment(P, A, B) || LW > g_segment(P, C, A)) {
        finalColor = BLACK;
      }
    }
    if(CN == 111) {
      if(LW > g_segment(P, A, B) || LW > g_segment(P, C, A) || LW > g_segment(P, B, C)) {
        finalColor = BLACK;
      }
    }
    if(CN == 2) {
      vec2 Cc = g_reflect(C, A, B);
      bool f;
      if(mod(ic, 2.) == 0.) {
        f = (ma != 2. && LW > g_segment(P, Cc, A)) || (mb != 2. && LW > g_segment(P, B, Cc));
      } else {
        f = (ma != 2. && LW > g_segment(P, C, A)) || (mb != 2. && LW > g_segment(P, B, C));
      }
      if(f)
        finalColor = BLACK;
    }
    if(CN == 222) {
      vec2 I = g_isodynam(A, B, C);
      vec2 Ia = g_reflect(I, B, C);
      vec2 Ib = g_reflect(I, C, A);
      vec2 Ic = g_reflect(I, A, B);
      vec2 Q = g_mean3(Ia, Ib, Ic);
      vec2 Qa = g_reflect(Q, B, C);
      vec2 Qb = g_reflect(Q, C, A);
      vec2 Qc = g_reflect(Q, A, B);
      vec2 Qbc = g_reflect(Qb, A, B);
      vec2 Qcb = g_reflect(Qc, C, A);
      bool f;
      if(mod(i, 2.) == 0.) {
        f = LW > g_segment(P, Qc, B) || LW > g_segment(P, B, Qa) || LW > g_segment(P, Qa, C) || LW > g_segment(P, C, Qb) || LW > g_segment(P, Qb, A) || LW > g_segment(P, A, Qc);
      } else {
        f = LW > g_segment(P, B, Q) || LW > g_segment(P, Q, C) || LW > g_segment(P, Q, A);
      }
      if(f)
        finalColor = BLACK;
    }
  } else {
    vec2 Q;
    if(CN == 1) {
      Q = C;
    } else if(CN == 10) {
      Q = B;
    } else if(CN == 100) {
      Q = A;
    } else if(CN == 11) {
      Q = g_v_2v1e(C, A, c, .5 * a);
    } else if(CN == 101) {
      Q = g_v_2v1e(A, B, a, .5 * b);
    } else if(CN == 110) {
      Q = g_v_2v1e(B, C, b, .5 * c);
    } else if(CN == 111) {
      Q = g_incenter(A, B, C);
    } else if(CN == 2) {
      Q = C;
      vec2 Qc = g_reflect(Q, A, B);
      vec2 Qca = g_reflect(Qc, B, C);
      vec2 Qcb = g_reflect(Qc, C, A);
      vec2 Qcac = g_reflect(Qca, A, B);
      vec2 Qcbc = g_reflect(Qcb, A, B);

      bool f;
      if(mod(ic, 2.) == 0.) {
        f = LW > g_segment(P, Q, Qcac) || LW > g_segment(P, Q, Qcbc);

        bool fa = 0. < g_line(P, Q, Qcac);
        bool fb = 0. < g_line(P, Q, Qcbc);
        if(fb)
          finalColor = COL_A;
        else
          finalColor = COL_B;
      } else {
        f = LW > g_segment(P, Qc, Qca) || LW > g_segment(P, Qc, Qcb);

        bool fa = 0. < g_line(P, Qc, Qca);
        bool fb = 0. < g_line(P, Qc, Qcb);
        if(fb)
          finalColor = COL_B;
        else
          finalColor = COL_A;
      }
      if(f)
        finalColor = BLACK;
      return;
    } else if(CN == 220) {
      Q = g_v_oss(C, A, B);
      vec2 Qa = g_reflect(Q, B, C);
      vec2 Qb = g_reflect(Q, C, A);
      vec2 Qab = g_reflect(Qa, C, A);
      vec2 Qac = g_reflect(Qa, A, B);
      vec2 Qba = g_reflect(Qb, B, C);
      vec2 Qbc = g_reflect(Qb, A, B);
      vec2 Qaca = g_reflect(Qac, B, C);
      vec2 Qbcb = g_reflect(Qbc, C, A);

      if(LW * 2. > g_distance(P, Q)) {
        finalColor = vec4(1., 0., 1., 1.);
        return;
      }

      bool f;
      if(mod(ia + ib, 2.) == 0.) {
        f = LW > g_segment(P, Q, Qaca) || LW > g_segment(P, Q, Qbcb) || LW > g_segment(P, Q, Qab) || LW > g_segment(P, Q, Qba);

        bool fa = 0. > g_line(P, Q, Qbcb);
        bool fb = 0. > g_line(P, Q, Qaca);
        bool fc = 0. > g_line(P, Q, Qab);
        bool fd = 0. > g_line(P, Q, Qba);
        if(fa)
          finalColor = COL_A;
        else if(!fb)
          finalColor = COL_B;
        else if(fc)
          finalColor = COL_D;
        else if(fd)
          finalColor = COL_C;
        else
          finalColor = COL_D;
      } else {
        f = LW > g_segment(P, Qa, Qb) || LW > g_segment(P, Qb, Qbc) || LW > g_segment(P, Qac, Qa);

        bool fb = 0. > g_line(P, Qac, Qa);
        bool fa = 0. > g_line(P, Qb, Qbc);
        bool fc = 0. > g_line(P, Qa, Qb);
        if(!fa)
          finalColor = COL_A;
        else if(!fb)
          finalColor = COL_B;
        else if(!fc)
          finalColor = COL_C;
        else
          finalColor = COL_D;
      }
      if(f)
        finalColor = BLACK;
      return;
    } else if(CN == 222) {
      Q = g_isodynam(A, B, C);
      vec2 Qa = g_reflect(Q, B, C);
      vec2 Qb = g_reflect(Q, C, A);
      vec2 Qc = g_reflect(Q, A, B);
      vec2 Qab = g_reflect(Qa, C, A);
      vec2 Qac = g_reflect(Qa, A, B);
      vec2 Qba = g_reflect(Qb, B, C);
      vec2 Qbc = g_reflect(Qb, A, B);
      vec2 Qca = g_reflect(Qc, B, C);
      vec2 Qcb = g_reflect(Qc, C, A);

      bool f;
      if(mod(i, 2.) == 0.) {
        f = (LW > g_segment(P, Q, Qab) || LW > g_segment(P, Q, Qac) || LW > g_segment(P, Q, Qba) || LW > g_segment(P, Q, Qbc) || LW > g_segment(P, Q, Qca) || LW > g_segment(P, Q, Qcb));

        bool fab = 0. > g_line(P, Q, Qab);
        bool fac = 0. > g_line(P, Q, Qac);
        bool fbc = 0. > g_line(P, Q, Qbc);
        bool fba = 0. > g_line(P, Q, Qba);
        bool fca = 0. > g_line(P, Q, Qca);
        bool fcb = 0. > g_line(P, Q, Qcb);
        if(fca && !fba)
          finalColor = COL_D;
        else if(fac && !fca)
          finalColor = COL_B;
        else if(fbc && !fac)
          finalColor = COL_D;
        else if(fcb && !fbc)
          finalColor = COL_A;
        else if(fab && !fcb)
          finalColor = COL_D;
        else if(fba && !fab)
          finalColor = COL_C;
      } else {
        f = (LW > g_segment(P, Qa, Qb) || LW > g_segment(P, Qb, Qc) || LW > g_segment(P, Qc, Qa));

        bool fa = 0. > g_line(P, Qb, Qc);
        bool fb = 0. > g_line(P, Qc, Qa);
        bool fc = 0. > g_line(P, Qa, Qb);

        if(fb && !fc)
          finalColor = COL_C;
        else if(fc && !fa)
          finalColor = COL_A;
        else if(fa && !fb)
          finalColor = COL_B;
        else
          finalColor = COL_D;
      }

      if(f) {
        finalColor = BLACK;
      }
      return;
    }

    // if(LW*2. > g_distance(P, Q)) {
    //   finalColor = WHITE;
    //   return;
    // }

    bool fa = 1e-4 > abs(g_line(Q, B, C)) ? 0. > g_line(P, A, Q) : 0. > g_line(P, Q, g_reflect(Q, B, C));
    bool fb = 1e-4 > abs(g_line(Q, C, A)) ? 0. > g_line(P, B, Q) : 0. > g_line(P, Q, g_reflect(Q, C, A));
    bool fc = 1e-4 > abs(g_line(Q, A, B)) ? 0. > g_line(P, C, Q) : 0. > g_line(P, Q, g_reflect(Q, A, B));

    if(fb && !fc)
      finalColor = COL_A;
    else if(fc && !fa)
      finalColor = COL_B;
    else if(fa && !fb)
      finalColor = COL_C;

    bool f = (LW > g_segment(P, Q, g_reflect(Q, B, C)) ||
      LW > g_segment(P, Q, g_reflect(Q, C, A)) ||
      LW > g_segment(P, Q, g_reflect(Q, A, B)));

    if(f) {
      finalColor = BLACK;
    }
    // finalColor *= pow((MI - i) / MI, 10.);
  }
}
