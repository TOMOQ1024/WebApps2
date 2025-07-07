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
struct Diagram {
  float ma;
  float mb;
  float mc;
  int na;
  int nb;
  int nc;
};
uniform Diagram uDiagram;
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

  float a = PI / uDiagram.ma;
  float b = PI / uDiagram.mb;
  float c = PI / uDiagram.mc;
  float BC = g_acos((cos(a) + cos(b) * cos(c)) / (sin(b) * sin(c)));
  float CA = g_asin(g_sin(BC) * sin(b) / sin(a));
  float AB = g_asin(g_sin(BC) * sin(c) / sin(a));
  vec2 A = vec2(0.f, 0.f);
  vec2 B = g_mul(AB, vec2(g_tan(.5f), 0.f));
  vec2 C = g_mul(CA, g_tan(.5f) * vec2(cos(a), sin(a)));

  // 線分のデバッグ
  // vec2 M = RD * mat2(1.f, 0.f, 0.f, -1.f) * (uMouse / uResolution * 2.f - 1.f);
  vec2 M = vec2(0.f, 0.f);
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

  // 単位円の描画
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
  // if(DRAW_MIRRORS && (LW / 8.f > g_segment(P, B, C) ||
  //   LW / 8.f > g_segment(P, C, A) ||
  //   LW / 8.f > g_segment(P, A, B))) {
  //   gl_FragColor = GREEN;
  //   return;
  // }

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
    switch(uDiagram.na*100 + uDiagram.nb*10 + uDiagram.nc) {
      case 1:
        if(LW > g_segment(P, A, B)) {
          gl_FragColor = BLACK;
        }
        break;
      case 11:
        if(LW > g_segment(P, A, B) || LW > g_segment(P, C, A)) {
          gl_FragColor = BLACK;
        }
        break;
      case 111:
        if(LW > g_segment(P, A, B) || LW > g_segment(P, C, A) || LW > g_segment(P, B, C)) {
          gl_FragColor = BLACK;
        }
        break;
    }
  } else {
    vec2 Q;
    switch(uDiagram.na*100 + uDiagram.nb*10 + uDiagram.nc) {
      case   1: Q = C; break;
      case  10: Q = B; break;
      case 100: Q = A; break;
      case  11: Q = g_v_2v1e(C, A, c, .5f * a); break;
      case 101: Q = g_v_2v1e(A, B, a, .5f * b); break;
      case 110: Q = g_v_2v1e(B, C, b, .5f * c); break;
      case 111: Q = g_incenter(A, B, C); break;
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
