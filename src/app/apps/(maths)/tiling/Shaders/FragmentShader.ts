import { mobiusGyrovector2Shader } from "./MobiusGyrovector2Shader";

export const fragmentShader = /* glsl */ `
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
struct Graph {
  vec2 origin;
  float radius;
};
uniform Graph uGraph;
uniform sampler2D uTexture;
uniform int uRenderMode;
uniform int uIterations;
varying vec2 vPosition;

${mobiusGyrovector2Shader}

void main() {
  gl_FragColor = WHITE;
  vec2 P = vPosition / min(uResolution.x, uResolution.y) * uGraph.radius + uGraph.origin;

  // gnomonic projection
  if(GNOMONIC_PROJ) {
    P /= 1.f + sqrt(1.f + cv * dot(P, P));
  }

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
  vec2 M = vec2(0.f, 0.f);
  // vec2 M = RD * mat2(1.f, 0.f, 0.f, -1.f) * (uMouse / uResolution * 2.f - 1.f);
  // if(LW > g_segment(P, M, M)) {
  //   gl_FragColor = GREEN;
  //   return;
  // }
  // if(LW > abs(g_line(P, M, M))) {
  //   gl_FragColor = RED;
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
  //   gl_FragColor = vec4(0., 0., 1., 1.);
  //   return;
  // }

  if(cv < 0.f && length(P) > 1.f) {
    return;
  }

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
    gl_FragColor = GREEN;
    return;
  }

  // 内接円の描画
  // if(LW / 2. > abs(g_distance(P, g_incenter(A, B, C)) + g_inradius(A, B, C))) {
  //   gl_FragColor = vec4(0., 0., 1., 1.);
  //   return;
  // }

  // vec2 q = incenter(a,b,c);
  // vec2 q = isodynam(a, b, c);

  // gl_FragColor = vec4(1., 0., 1., 1.);

  // vec2 Q = g_v_2v1e(A, B, .5*a, b);
  // vec2 Q = g_v_2v1e(B, C, b, .5 * c);
  if(DUAL) {
    gl_FragColor = COL_A;
    if(CN == 1) {
      if(LW > g_segment(P, A, B)) {
        gl_FragColor = BLACK;
      }
    }
    if(CN == 11) {
      if(LW > g_segment(P, A, B) || LW > g_segment(P, C, A)) {
        gl_FragColor = BLACK;
      }
    }
    if(CN == 111) {
      if(LW > g_segment(P, A, B) || LW > g_segment(P, C, A) || LW > g_segment(P, B, C)) {
        gl_FragColor = BLACK;
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
        gl_FragColor = BLACK;
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
        gl_FragColor = BLACK;
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
          gl_FragColor = COL_A;
        else
          gl_FragColor = COL_B;
      } else {
        f = LW > g_segment(P, Qc, Qca) || LW > g_segment(P, Qc, Qcb);

        bool fa = 0.f < g_line(P, Qc, Qca);
        bool fb = 0.f < g_line(P, Qc, Qcb);
        if(fb)
          gl_FragColor = COL_B;
        else
          gl_FragColor = COL_A;
      }
      if(f)
        gl_FragColor = BLACK;
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
        gl_FragColor = vec4(1.f, 0.f, 1.f, 1.f);
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
          gl_FragColor = COL_A;
        else if(!fb)
          gl_FragColor = COL_B;
        else if(fc)
          gl_FragColor = COL_D;
        else if(fd)
          gl_FragColor = COL_C;
        else
          gl_FragColor = COL_D;
      } else {
        f = LW > g_segment(P, Qa, Qb) || LW > g_segment(P, Qb, Qbc) || LW > g_segment(P, Qac, Qa);

        bool fb = 0.f > g_line(P, Qac, Qa);
        bool fa = 0.f > g_line(P, Qb, Qbc);
        bool fc = 0.f > g_line(P, Qa, Qb);
        if(!fa)
          gl_FragColor = COL_A;
        else if(!fb)
          gl_FragColor = COL_B;
        else if(!fc)
          gl_FragColor = COL_C;
        else
          gl_FragColor = COL_D;
      }
      if(f)
        gl_FragColor = BLACK;
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
          gl_FragColor = COL_D;
        else if(fac && !fca)
          gl_FragColor = COL_B;
        else if(fbc && !fac)
          gl_FragColor = COL_D;
        else if(fcb && !fbc)
          gl_FragColor = COL_A;
        else if(fab && !fcb)
          gl_FragColor = COL_D;
        else if(fba && !fab)
          gl_FragColor = COL_C;
      } else {
        f = (LW > g_segment(P, Qa, Qb) || LW > g_segment(P, Qb, Qc) || LW > g_segment(P, Qc, Qa));

        bool fa = 1e-5f > g_line(P, Qb, Qc);
        bool fb = 1e-5f > g_line(P, Qc, Qa);
        bool fc = 1e-5f > g_line(P, Qa, Qb);

        if(fb && !fc)
          gl_FragColor = COL_C;
        else if(fc && !fa)
          gl_FragColor = COL_A;
        else if(fa && !fb)
          gl_FragColor = COL_B;
        else
          gl_FragColor = COL_D;
      }

      if(f) {
        gl_FragColor = BLACK;
      }
      return;
    }

    // if(LW*2. > g_distance(P, Q)) {
    //   gl_FragColor = WHITE;
    //   return;
    // }

    bool fa = 1e-4f > abs(g_line(Q, B, C)) ? 0.f > g_line(P, A, Q) : 0.f > g_line(P, Q, g_reflect(Q, B, C));
    bool fb = 1e-4f > abs(g_line(Q, C, A)) ? 0.f > g_line(P, B, Q) : 0.f > g_line(P, Q, g_reflect(Q, C, A));
    bool fc = 1e-4f > abs(g_line(Q, A, B)) ? 0.f > g_line(P, C, Q) : 0.f > g_line(P, Q, g_reflect(Q, A, B));

    if(fb && !fc)
      gl_FragColor = COL_A;
    else if(fc && !fa)
      gl_FragColor = COL_B;
    else if(fa && !fb)
      gl_FragColor = COL_C;

    bool f = (LW > g_segment(P, Q, g_reflect(Q, B, C)) ||
      LW > g_segment(P, Q, g_reflect(Q, C, A)) ||
      LW > g_segment(P, Q, g_reflect(Q, A, B)));

    if(f) {
      gl_FragColor = BLACK;
    }
    // gl_FragColor *= pow((MI - i) / MI, 10.);
  }
}
`;
