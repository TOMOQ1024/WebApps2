#version 300 es
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
#define COL_A vec4(.8, 1., 1., 1.)
#define COL_B vec4(.2, .5, 1., 1.)
#define COL_C vec4(.8, .8, 1., 1.)
#define COL_D vec4(1., 1., .7, 1.)
#define COL_E vec4(.7, 1., 1., 1.)
#define LW .02
#define RD 5.
#define MI 30.

#define STEREO_PROJ !true
#define DRAW_MIRRORS !true
#define DUAL !true
#define CN  1

#define ma 5.
#define mb 3.
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

// \frac{A\sin2\alpha+B\sin2\beta}{\sin2\alpha+\sin2\beta}

void main() {
  finalColor = WHITE;
  vec2 P = RD * mat2(1.f, 0.f, 0.f, -1.f) * (vPosition * 2.f - 1.f);

  float a = PI / ma;
  float b = PI / mb;
  float c = PI / mc;
  float BC = g_acos((cos(a) + cos(b) * cos(c)) / (sin(b) * sin(c)));
  float CA = g_asin(g_sin(BC) * sin(b) / sin(a));
  float AB = g_asin(g_sin(BC) * sin(c) / sin(a));
  vec2 A = vec2(0.f, 0.f);
  vec2 B = g_mul(AB, vec2(g_tan(.5f), 0.f));
  vec2 C = g_mul(CA, g_tan(.5f) * vec2(cos(a), sin(a)));

  // 線分のデバッグ
  vec2 M = RD * mat2(1.f, 0.f, 0.f, -1.f) * (uMouse / uResolution * 2.f - 1.f);
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
    if(cv > 0.f) {
      if(length(P) > 1.f)
        return;
      P = normalize(P) * length(P) / (1.f + sqrt(1.f - dot(P, P)));
      M = .5f * vec2(cos(uTime), sin(uTime));
    }
    if(cv < 0.f) {
      // if(length(P) > 1.)return;
      P = normalize(P) * length(P) / (1.f + sqrt(1.f + dot(P, P)));
      M = .5f * vec2(cos(uTime / 2.f), sin(uTime / 2.f));
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
  for(float _i = 0.f; _i < MI; _i++) {
    i = _i;
    if(1e-3f < g_line(P, B, C)) {
      P = g_reflect(P, B, C);
      ++ia;
    } else if(1e-3f < g_line(P, C, A)) {
      P = g_reflect(P, C, A);
      ++ib;
    } else if(1e-3f < g_line(P, A, B)) {
      P = g_reflect(P, A, B);
      ++ic;
    } else
      break;
  }

  // 鏡面の描画
  if(DRAW_MIRRORS && (LW / 8.f > g_segment(P, B, C) ||
    LW / 8.f > g_segment(P, C, A) ||
    LW / 8.f > g_segment(P, A, B))) {
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
      if(mod(ic, 2.f) == 0.f) {
        f = (ma != 2.f && LW > g_segment(P, Cc, A)) || (mb != 2.f && LW > g_segment(P, B, Cc));
      } else {
        f = (ma != 2.f && LW > g_segment(P, C, A)) || (mb != 2.f && LW > g_segment(P, B, C));
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
      if(mod(i, 2.f) == 0.f) {
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
      Q = g_v_2v1e(C, A, c, .5f * a);
    } else if(CN == 101) {
      Q = g_v_2v1e(A, B, a, .5f * b);
    } else if(CN == 110) {
      Q = g_v_2v1e(B, C, b, .5f * c);
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
      if(mod(ic, 2.f) == 0.f) {
        f = LW > g_segment(P, Q, Qcac) || LW > g_segment(P, Q, Qcbc);

        bool fa = 0.f < g_line(P, Q, Qcac);
        bool fb = 0.f < g_line(P, Q, Qcbc);
        if(fb)
          finalColor = COL_A;
        else
          finalColor = COL_B;
      } else {
        f = LW > g_segment(P, Qc, Qca) || LW > g_segment(P, Qc, Qcb);

        bool fa = 0.f < g_line(P, Qc, Qca);
        bool fb = 0.f < g_line(P, Qc, Qcb);
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

      if(LW * 2.f > g_distance(P, Q)) {
        finalColor = vec4(1.f, 0.f, 1.f, 1.f);
        return;
      }

      bool f;
      if(mod(ia + ib, 2.f) == 0.f) {
        f = LW > g_segment(P, Q, Qaca) || LW > g_segment(P, Q, Qbcb) || LW > g_segment(P, Q, Qab) || LW > g_segment(P, Q, Qba);

        bool fa = 0.f > g_line(P, Q, Qbcb);
        bool fb = 0.f > g_line(P, Q, Qaca);
        bool fc = 0.f > g_line(P, Q, Qab);
        bool fd = 0.f > g_line(P, Q, Qba);
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

        bool fb = 0.f > g_line(P, Qac, Qa);
        bool fa = 0.f > g_line(P, Qb, Qbc);
        bool fc = 0.f > g_line(P, Qa, Qb);
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
      if(mod(i, 2.f) == 0.f) {
        f = (LW > g_segment(P, Q, Qab) || LW > g_segment(P, Q, Qac) || LW > g_segment(P, Q, Qba) || LW > g_segment(P, Q, Qbc) || LW > g_segment(P, Q, Qca) || LW > g_segment(P, Q, Qcb));

        bool fab = 0.f > g_line(P, Q, Qab);
        bool fac = 0.f > g_line(P, Q, Qac);
        bool fbc = 0.f > g_line(P, Q, Qbc);
        bool fba = 0.f > g_line(P, Q, Qba);
        bool fca = 0.f > g_line(P, Q, Qca);
        bool fcb = 0.f > g_line(P, Q, Qcb);
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

        bool fa = 1e-5f > g_line(P, Qb, Qc);
        bool fb = 1e-5f > g_line(P, Qc, Qa);
        bool fc = 1e-5f > g_line(P, Qa, Qb);

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

    bool fa = 1e-4f > abs(g_line(Q, B, C)) ? 0.f > g_line(P, A, Q) : 0.f > g_line(P, Q, g_reflect(Q, B, C));
    bool fb = 1e-4f > abs(g_line(Q, C, A)) ? 0.f > g_line(P, B, Q) : 0.f > g_line(P, Q, g_reflect(Q, C, A));
    bool fc = 1e-4f > abs(g_line(Q, A, B)) ? 0.f > g_line(P, C, Q) : 0.f > g_line(P, Q, g_reflect(Q, A, B));

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
