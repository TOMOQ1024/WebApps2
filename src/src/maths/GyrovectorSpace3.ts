import { Matrix3, Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils.js";

declare module "three" {
  interface Matrix3 {
    adjugate(): Matrix3;
  }
}

// Matrix3の拡張
(Matrix3.prototype as any).adjugate = function () {
  const a = this.elements;
  const result = new Matrix3();
  const r = result.elements;

  // 余因子行列の計算
  r[0] = a[4] * a[8] - a[5] * a[7];
  r[1] = -(a[1] * a[8] - a[2] * a[7]);
  r[2] = a[1] * a[5] - a[2] * a[4];
  r[3] = -(a[3] * a[8] - a[5] * a[6]);
  r[4] = a[0] * a[8] - a[2] * a[6];
  r[5] = -(a[0] * a[5] - a[2] * a[3]);
  r[6] = a[3] * a[7] - a[4] * a[6];
  r[7] = -(a[0] * a[7] - a[1] * a[6]);
  r[8] = a[0] * a[4] - a[1] * a[3];

  return result;
};

export interface Hyperplane3 {
  i: Vector3;
  k: number;
}

export class GyrovectorSpace3 {
  curvature = 1;
  radius = 1;

  cos(x: number) {
    if (this.curvature < 0) return this.radius * Math.cosh(x / this.radius);
    if (this.curvature > 0) return this.radius * Math.cos(x / this.radius);
    return 1;
  }

  acos(x: number) {
    if (this.curvature < 0) return this.radius * Math.acosh(x / this.radius);
    if (this.curvature > 0) return this.radius * Math.acos(x / this.radius);
    return x;
  }

  sin(x: number) {
    if (this.curvature < 0) return this.radius * Math.sinh(x / this.radius);
    if (this.curvature > 0) return this.radius * Math.sin(x / this.radius);
    return x;
  }

  asin(x: number) {
    if (this.curvature < 0) return this.radius * Math.asinh(x / this.radius);
    if (this.curvature > 0)
      return this.radius * Math.asin(clamp(x / this.radius, -1, 1));
    return x;
  }

  tan(x: number) {
    if (this.curvature < 0) return this.radius * Math.tanh(x / this.radius);
    if (this.curvature > 0) return this.radius * Math.tan(x / this.radius);
    return x;
  }

  atan(x: number) {
    if (this.curvature < 0) return this.radius * Math.atanh(x / this.radius);
    if (this.curvature > 0) return this.radius * Math.atan(x / this.radius);
    return x;
  }

  dot(P: Vector3, Q: Vector3) {
    return P.x * Q.x + P.y * Q.y + P.z * Q.z;
  }

  add(P: Vector3, Q: Vector3) {
    const A = P.clone().multiplyScalar(
      1 - 2 * this.curvature * this.dot(P, Q) - this.curvature * Q.lengthSq()
    );
    const B = Q.clone().multiplyScalar(1 + this.curvature * P.lengthSq());
    return A.add(B).divideScalar(
      1 -
        2 * this.curvature * this.dot(P, Q) +
        this.curvature * this.curvature * P.lengthSq() * Q.lengthSq()
    );
  }

  sub(P: Vector3, Q: Vector3) {
    return this.add(Q.clone().negate(), P);
  }

  length(P: Vector3) {
    return 2 * this.atan(P.length());
  }

  distance(P: Vector3, Q: Vector3) {
    return 2 * this.atan(this.sub(P, Q).length());
  }

  mul(r: number, P: Vector3) {
    if (r === 0 || P.length() === 0) return new Vector3(0, 0);
    return P.clone()
      .normalize()
      .multiplyScalar(this.tan(r * this.atan(P.length())));
  }

  normal(P: Vector3) {
    return new Vector3(P.y, -P.x);
  }

  normalize(P: Vector3) {
    return P.clone().normalize().multiplyScalar(this.tan(0.5));
  }

  reflect(V: Vector3, P: Vector3, Q: Vector3, R: Vector3) {
    const { i, k } = this.hyperplane(P, Q, R);
    const v = V.clone();
    const vDotI = v.dot(i);
    const vLengthSq = v.lengthSq();
    const iLengthSq = i.lengthSq();

    const numerator = v
      .clone()
      .multiplyScalar(4 * k * k + iLengthSq)
      .sub(i.clone().multiplyScalar(2 * (vDotI - k * vLengthSq + k)));

    const denominator = v
      .clone()
      .multiplyScalar(2 * k)
      .sub(i)
      .lengthSq();

    return numerator.divideScalar(denominator);
  }

  hyperplane(P: Vector3, Q: Vector3, R: Vector3) {
    const m = new Matrix3(...P.toArray(), ...Q.toArray(), ...R.toArray());
    const det = m.determinant();

    const i = new Vector3(
      P.lengthSq() * this.curvature - 1,
      Q.lengthSq() * this.curvature - 1,
      R.lengthSq() * this.curvature - 1
    ).applyMatrix3(m.adjugate());

    return { i, k: det };
  }

  invertHyperplane(h: Hyperplane3) {
    return { i: h.i.clone().negate(), k: -h.k };
  }

  midHyperplane(h1: Hyperplane3, h2: Hyperplane3) {
    const ra = Math.sqrt(h2.i.lengthSq() + 4 * h2.k * h2.k);
    const rb = Math.sqrt(h1.i.lengthSq() + 4 * h1.k * h1.k);

    const i = h1.i
      .clone()
      .multiplyScalar(ra)
      .add(h2.i.clone().multiplyScalar(rb));
    const k = h1.k * ra + h2.k * rb;

    return { i, k };
  }

  // get one of two intersection points of three hyperplanes
  intersectionPoint(h1: Hyperplane3, h2: Hyperplane3, h3: Hyperplane3) {
    // T_{AB}=k_{B}i_{A}-k_{A}i_{B} の計算
    const TAB = h2.i
      .clone()
      .multiplyScalar(h1.k)
      .sub(h1.i.clone().multiplyScalar(h2.k));
    const TBC = h3.i
      .clone()
      .multiplyScalar(h2.k)
      .sub(h2.i.clone().multiplyScalar(h3.k));
    const TCA = h1.i
      .clone()
      .multiplyScalar(h3.k)
      .sub(h3.i.clone().multiplyScalar(h1.k));

    // ゼロベクトルでない2つを選ぶ
    const arr = [TAB, TBC, TCA].map((v) => v.normalize());
    if (Math.abs(h1.k) < 1e-10) arr.push(h1.i.normalize());
    if (Math.abs(h2.k) < 1e-10) arr.push(h2.i.normalize());
    if (Math.abs(h3.k) < 1e-10) arr.push(h3.i.normalize());
    let [T1, T2] = arr.toSorted((a, b) => b.lengthSq() - a.lengthSq());
    if (T1.lengthSq() < 1e-10) {
      throw new Error("Invalid hyperplanes");
    }
    if (T2.lengthSq() < 1e-10) {
      T2 = [h1.i, h2.i, h3.i].toSorted(
        (a, b) => b.lengthSq() - a.lengthSq()
      )[0];
    }

    let hP: Hyperplane3;
    if (Math.abs(h1.k) > 1e-10) hP = h1;
    else if (Math.abs(h2.k) > 1e-10) hP = h2;
    else hP = h3;

    // T_{x},T_{y},T_{z}の計算
    const T = new Vector3(
      T1.y * T2.z - T1.z * T2.y,
      T1.z * T2.x - T1.x * T2.z,
      T1.x * T2.y - T1.y * T2.x
    );

    // 分母の計算
    const denominator = 2 * hP.k * T.lengthSq();

    // 分子の計算
    const dotTiB = T.dot(hP.i);
    const numerator =
      dotTiB + Math.sqrt(dotTiB * dotTiB + 4 * hP.k * hP.k * T.lengthSq());

    return T.multiplyScalar(numerator / denominator);
  }

  // 四面体の内心
  incenter4(P: Vector3, Q: Vector3, R: Vector3, S: Vector3) {
    const Hp = this.hyperplane(Q, R, S);
    const Hq = this.hyperplane(P, S, R);
    const Hr = this.hyperplane(S, P, Q);
    const Hs = this.hyperplane(R, Q, P);

    // const Mpq = this.midHyperplane(Hp, Hq);
    // const Mpr = this.midHyperplane(Hp, Hr);
    // const Mps = this.midHyperplane(Hp, Hs);
    const Mpq = this.midHyperplane(Hp, this.invertHyperplane(Hq));
    const Mpr = this.midHyperplane(Hp, this.invertHyperplane(Hr));
    const Mps = this.midHyperplane(Hp, this.invertHyperplane(Hs));

    const intersection = this.intersectionPoint(Mpq, Mpr, Mps);

    return intersection;
  }

  // v_2v1e(P: Vector3, Q: Vector3, p: number, q: number) {
  //   const l = this.distance(P, Q);
  //   const r = Math.acos(
  //     -Math.cos(p) * Math.cos(q) + Math.sin(p) * Math.sin(q) * this.cos(l)
  //   );
  //   const a = this.angle1(this.sub(Q, P)) + p;
  //   return this.add(
  //     P,
  //     this.mul(
  //       this.asin((this.sin(l) * Math.sin(q)) / Math.sin(r)),
  //       this.normalize(new Vector3(Math.cos(a), Math.sin(a)))
  //     )
  //   );
  // }

  // area(P: Vector3, Q: Vector3, R: Vector3) {
  //   if (this.curvature === 0) {
  //     const p = this.distance(Q, R);
  //     const q = this.distance(R, P);
  //     const r = this.distance(P, Q);
  //     const s = (p + q + r) / 2;
  //     return Math.sqrt(s * (s - p) * (s - q) * (s - r));
  //   }
  //   return (
  //     this.curvature *
  //     (Math.abs(
  //       this.angle3(R, P, Q) + this.angle3(P, Q, R) + this.angle3(Q, R, P)
  //     ) -
  //       Math.PI)
  //   );
  // }

  // isodynam(P: Vector3, Q: Vector3, R: Vector3) {
  //   let pp = this.distance(Q, R);
  //   let qq = this.distance(R, P);
  //   let rr = this.distance(P, Q);
  //   pp *= pp;
  //   qq *= qq;
  //   rr *= rr;
  //   const lp = 2 / (1 + this.curvature * P.lengthSq());
  //   const lq = 2 / (1 + this.curvature * Q.lengthSq());
  //   const lr = 2 / (1 + this.curvature * R.lengthSq());
  //   const s = this.area(P, Q, R);
  //   const gp = pp * (((pp - qq - rr) * Math.sqrt(3)) / 4 - s);
  //   const gq = qq * (((qq - rr - pp) * Math.sqrt(3)) / 4 - s);
  //   const gr = rr * (((rr - pp - qq) * Math.sqrt(3)) / 4 - s);
  //   const m = gp * (lp - 1) + gq * (lq - 1) + gr * (lr - 1);
  //   return this.mul(
  //     0.5,
  //     P.clone()
  //       .multiplyScalar(gp * lp)
  //       .add(Q.clone().multiplyScalar(gq * lq))
  //       .add(R.clone().multiplyScalar(gr * lr))
  //       .divideScalar(m)
  //   );
  // }

  // v_oss(P: Vector3, Q: Vector3, R: Vector3) {
  //   const q = this.angle3(P, Q, R);
  //   const r = this.angle3(Q, R, P);
  //   const lp = 2 / (1 + this.curvature * P.lengthSq());
  //   const lq = 2 / (1 + this.curvature * Q.lengthSq());
  //   const lr = 2 / (1 + this.curvature * R.lengthSq());
  //   const gp = 0;
  //   const gq = Math.sin(2 * q);
  //   const gr = Math.sin(2 * r);
  //   const m = gp * (lp - 1) + gq * (lq - 1) + gr * (lr - 1);
  //   return this.mul(
  //     0.5,
  //     P.clone()
  //       .multiplyScalar(gp * lp)
  //       .add(Q.clone().multiplyScalar(gq * lq))
  //       .add(R.clone().multiplyScalar(gr * lr))
  //       .divideScalar(m)
  //   );
  // }

  antipode(P: Vector3) {
    // \frac{-C}{\left|C\right|^{2}}
    return P.clone().negate().divideScalar(P.lengthSq());
  }

  mean(...P: Vector3[]) {
    const l = P.map((p) => 2 / (1 + this.curvature * p.lengthSq()));
    const m = l.reduce((a, b) => a + b) - l.length;
    const V = new Vector3(0, 0, 0);
    for (let i = 0; i < P.length; i++) {
      V.add(P[i].clone().multiplyScalar(l[i]));
    }
    const A = this.mul(0.5, V.divideScalar(m));
    if (this.curvature <= 0) return A;
    const B = this.antipode(A);
    return this.distance(P[0], A) < this.distance(P[0], B) ? A : B;
  }
}

// void main() {
//   finalColor = WHITE;
//   vec2 P = RD * mat2(1., 0., 0., -1.) * (vPosition * 2. - 1.);

//   float a = PI / ma;
//   float b = PI / mb;
//   float c = PI / mc;
//   float BC = g_acos((cos(a) + cos(b) * cos(c)) / (sin(b) * sin(c)));
//   float CA = g_asin(g_sin(BC) * sin(b) / sin(a));
//   float AB = g_asin(g_sin(BC) * sin(c) / sin(a));
//   vec2 A = vec2(0., 0.);
//   vec2 B = g_mul(AB, vec2(g_tan(.5), 0.));
//   vec2 C = g_mul(CA, g_tan(.5) * vec2(cos(a), sin(a)));

//   // 線分のデバッグ
//   vec2 M = RD * mat2(1., 0., 0., -1.) * (uMouse / uResolution * 2. - 1.);
//   // if(LW > g_segment(P, M, M)) {
//   //   finalColor = GREEN;
//   //   return;
//   // }
//   // if(LW > abs(g_line(P, M, M))) {
//   //   finalColor = RED;
//   //   return;
//   // }

//   // 投影
//   if(STEREO_PROJ) {
//     if(cv > 0.) {
//       if(length(P) > 1.)
//         return;
//       P = normalize(P) * length(P) / (1. + sqrt(1. - dot(P, P)));
//       M = .5 * vec2(cos(uTime), sin(uTime));
//     }
//     if(cv < 0.) {
//       // if(length(P) > 1.)return;
//       P = normalize(P) * length(P) / (1. + sqrt(1. + dot(P, P)));
//       M = .5 * vec2(cos(uTime / 2.), sin(uTime / 2.));
//     }
//     A = g_sub(A, M);
//     B = g_sub(B, M);
//     C = g_sub(C, M);
//   }

//   // 円の描画
//   // if(LW / 4. > abs(length(P) - 1.)) {
//   //   finalColor = vec4(0., 0., 1., 1.);
//   //   return;
//   // }

//   // if(cv < 0. && length(P) > 1.) {
//   //   return;
//   // }

//   float i, ia, ib, ic;
//   for(float _i = 0.; _i < MI; _i++) {
//     i = _i;
//     if(0. < g_line(P, B, C)) {
//       P = g_reflect(P, B, C);
//       ++ia;
//     } else if(0. < g_line(P, C, A)) {
//       P = g_reflect(P, C, A);
//       ++ib;
//     } else if(0. < g_line(P, A, B)) {
//       P = g_reflect(P, A, B);
//       ++ic;
//     } else
//       break;
//   }

//   // 鏡面の描画
//   if(DRAW_MIRRORS && (LW / 8. > g_segment(P, B, C) ||
//     LW / 8. > g_segment(P, C, A) ||
//     LW / 8. > g_segment(P, A, B))) {
//     finalColor = GREEN;
//     return;
//   }

//   // 内接円の描画
//   // if(LW / 2. > abs(g_distance(P, g_incenter(A, B, C)) + g_inradius(A, B, C))) {
//   //   finalColor = vec4(0., 0., 1., 1.);
//   //   return;
//   // }

//   // vec2 q = incenter(a,b,c);
//   // vec2 q = isodynam(a, b, c);

//   // finalColor = vec4(1., 0., 1., 1.);

//   // vec2 Q = g_v_2v1e(A, B, .5*a, b);
//   // vec2 Q = g_v_2v1e(B, C, b, .5 * c);
//   if(DUAL) {
//     finalColor = COL_A;
//     if(CN == 1) {
//       if(LW > g_segment(P, A, B)) {
//         finalColor = BLACK;
//       }
//     }
//     if(CN == 11) {
//       if(LW > g_segment(P, A, B) || LW > g_segment(P, C, A)) {
//         finalColor = BLACK;
//       }
//     }
//     if(CN == 111) {
//       if(LW > g_segment(P, A, B) || LW > g_segment(P, C, A) || LW > g_segment(P, B, C)) {
//         finalColor = BLACK;
//       }
//     }
//     if(CN == 2) {
//       vec2 Cc = g_reflect(C, A, B);
//       bool f;
//       if(mod(ic, 2.) == 0.) {
//         f = (ma != 2. && LW > g_segment(P, Cc, A)) || (mb != 2. && LW > g_segment(P, B, Cc));
//       } else {
//         f = (ma != 2. && LW > g_segment(P, C, A)) || (mb != 2. && LW > g_segment(P, B, C));
//       }
//       if(f)
//         finalColor = BLACK;
//     }
//     if(CN == 222) {
//       vec2 I = g_isodynam(A, B, C);
//       vec2 Ia = g_reflect(I, B, C);
//       vec2 Ib = g_reflect(I, C, A);
//       vec2 Ic = g_reflect(I, A, B);
//       vec2 Q = g_mean3(Ia, Ib, Ic);
//       vec2 Qa = g_reflect(Q, B, C);
//       vec2 Qb = g_reflect(Q, C, A);
//       vec2 Qc = g_reflect(Q, A, B);
//       vec2 Qbc = g_reflect(Qb, A, B);
//       vec2 Qcb = g_reflect(Qc, C, A);
//       bool f;
//       if(mod(i, 2.) == 0.) {
//         f = LW > g_segment(P, Qc, B) || LW > g_segment(P, B, Qa) || LW > g_segment(P, Qa, C) || LW > g_segment(P, C, Qb) || LW > g_segment(P, Qb, A) || LW > g_segment(P, A, Qc);
//       } else {
//         f = LW > g_segment(P, B, Q) || LW > g_segment(P, Q, C) || LW > g_segment(P, Q, A);
//       }
//       if(f)
//         finalColor = BLACK;
//     }
//   } else {
//     vec2 Q;
//     if(CN == 1) {
//       Q = C;
//     } else if(CN == 10) {
//       Q = B;
//     } else if(CN == 100) {
//       Q = A;
//     } else if(CN == 11) {
//       Q = g_v_2v1e(C, A, c, .5 * a);
//     } else if(CN == 101) {
//       Q = g_v_2v1e(A, B, a, .5 * b);
//     } else if(CN == 110) {
//       Q = g_v_2v1e(B, C, b, .5 * c);
//     } else if(CN == 111) {
//       Q = g_incenter(A, B, C);
//     } else if(CN == 2) {
//       Q = C;
//       vec2 Qc = g_reflect(Q, A, B);
//       vec2 Qca = g_reflect(Qc, B, C);
//       vec2 Qcb = g_reflect(Qc, C, A);
//       vec2 Qcac = g_reflect(Qca, A, B);
//       vec2 Qcbc = g_reflect(Qcb, A, B);

//       bool f;
//       if(mod(ic, 2.) == 0.) {
//         f = LW > g_segment(P, Q, Qcac) || LW > g_segment(P, Q, Qcbc);

//         bool fa = 0. < g_line(P, Q, Qcac);
//         bool fb = 0. < g_line(P, Q, Qcbc);
//         if(fb)
//           finalColor = COL_A;
//         else
//           finalColor = COL_B;
//       } else {
//         f = LW > g_segment(P, Qc, Qca) || LW > g_segment(P, Qc, Qcb);

//         bool fa = 0. < g_line(P, Qc, Qca);
//         bool fb = 0. < g_line(P, Qc, Qcb);
//         if(fb)
//           finalColor = COL_B;
//         else
//           finalColor = COL_A;
//       }
//       if(f)
//         finalColor = BLACK;
//       return;
//     } else if(CN == 220) {
//       Q = g_v_oss(C, A, B);
//       vec2 Qa = g_reflect(Q, B, C);
//       vec2 Qb = g_reflect(Q, C, A);
//       vec2 Qab = g_reflect(Qa, C, A);
//       vec2 Qac = g_reflect(Qa, A, B);
//       vec2 Qba = g_reflect(Qb, B, C);
//       vec2 Qbc = g_reflect(Qb, A, B);
//       vec2 Qaca = g_reflect(Qac, B, C);
//       vec2 Qbcb = g_reflect(Qbc, C, A);

//       if(LW * 2. > g_distance(P, Q)) {
//         finalColor = vec4(1., 0., 1., 1.);
//         return;
//       }

//       bool f;
//       if(mod(ia + ib, 2.) == 0.) {
//         f = LW > g_segment(P, Q, Qaca) || LW > g_segment(P, Q, Qbcb) || LW > g_segment(P, Q, Qab) || LW > g_segment(P, Q, Qba);

//         bool fa = 0. > g_line(P, Q, Qbcb);
//         bool fb = 0. > g_line(P, Q, Qaca);
//         bool fc = 0. > g_line(P, Q, Qab);
//         bool fd = 0. > g_line(P, Q, Qba);
//         if(fa)
//           finalColor = COL_A;
//         else if(!fb)
//           finalColor = COL_B;
//         else if(fc)
//           finalColor = COL_D;
//         else if(fd)
//           finalColor = COL_C;
//         else
//           finalColor = COL_D;
//       } else {
//         f = LW > g_segment(P, Qa, Qb) || LW > g_segment(P, Qb, Qbc) || LW > g_segment(P, Qac, Qa);

//         bool fb = 0. > g_line(P, Qac, Qa);
//         bool fa = 0. > g_line(P, Qb, Qbc);
//         bool fc = 0. > g_line(P, Qa, Qb);
//         if(!fa)
//           finalColor = COL_A;
//         else if(!fb)
//           finalColor = COL_B;
//         else if(!fc)
//           finalColor = COL_C;
//         else
//           finalColor = COL_D;
//       }
//       if(f)
//         finalColor = BLACK;
//       return;
//     } else if(CN == 222) {
//       Q = g_isodynam(A, B, C);
//       vec2 Qa = g_reflect(Q, B, C);
//       vec2 Qb = g_reflect(Q, C, A);
//       vec2 Qc = g_reflect(Q, A, B);
//       vec2 Qab = g_reflect(Qa, C, A);
//       vec2 Qac = g_reflect(Qa, A, B);
//       vec2 Qba = g_reflect(Qb, B, C);
//       vec2 Qbc = g_reflect(Qb, A, B);
//       vec2 Qca = g_reflect(Qc, B, C);
//       vec2 Qcb = g_reflect(Qc, C, A);

//       bool f;
//       if(mod(i, 2.) == 0.) {
//         f = (LW > g_segment(P, Q, Qab) || LW > g_segment(P, Q, Qac) || LW > g_segment(P, Q, Qba) || LW > g_segment(P, Q, Qbc) || LW > g_segment(P, Q, Qca) || LW > g_segment(P, Q, Qcb));

//         bool fab = 0. > g_line(P, Q, Qab);
//         bool fac = 0. > g_line(P, Q, Qac);
//         bool fbc = 0. > g_line(P, Q, Qbc);
//         bool fba = 0. > g_line(P, Q, Qba);
//         bool fca = 0. > g_line(P, Q, Qca);
//         bool fcb = 0. > g_line(P, Q, Qcb);
//         if(fca && !fba)
//           finalColor = COL_D;
//         else if(fac && !fca)
//           finalColor = COL_B;
//         else if(fbc && !fac)
//           finalColor = COL_D;
//         else if(fcb && !fbc)
//           finalColor = COL_A;
//         else if(fab && !fcb)
//           finalColor = COL_D;
//         else if(fba && !fab)
//           finalColor = COL_C;
//       } else {
//         f = (LW > g_segment(P, Qa, Qb) || LW > g_segment(P, Qb, Qc) || LW > g_segment(P, Qc, Qa));

//         bool fa = 0. > g_line(P, Qb, Qc);
//         bool fb = 0. > g_line(P, Qc, Qa);
//         bool fc = 0. > g_line(P, Qa, Qb);

//         if(fb && !fc)
//           finalColor = COL_C;
//         else if(fc && !fa)
//           finalColor = COL_A;
//         else if(fa && !fb)
//           finalColor = COL_B;
//         else
//           finalColor = COL_D;
//       }

//       if(f) {
//         finalColor = BLACK;
//       }
//       return;
//     }

//     // if(LW*2. > g_distance(P, Q)) {
//     //   finalColor = WHITE;
//     //   return;
//     // }

//     bool fa = 1e-4 > abs(g_line(Q, B, C)) ? 0. > g_line(P, A, Q) : 0. > g_line(P, Q, g_reflect(Q, B, C));
//     bool fb = 1e-4 > abs(g_line(Q, C, A)) ? 0. > g_line(P, B, Q) : 0. > g_line(P, Q, g_reflect(Q, C, A));
//     bool fc = 1e-4 > abs(g_line(Q, A, B)) ? 0. > g_line(P, C, Q) : 0. > g_line(P, Q, g_reflect(Q, A, B));

//     if(fb && !fc)
//       finalColor = COL_A;
//     else if(fc && !fa)
//       finalColor = COL_B;
//     else if(fa && !fb)
//       finalColor = COL_C;

//     bool f = (LW > g_segment(P, Q, g_reflect(Q, B, C)) ||
//       LW > g_segment(P, Q, g_reflect(Q, C, A)) ||
//       LW > g_segment(P, Q, g_reflect(Q, A, B)));

//     if(f) {
//       finalColor = BLACK;
//     }
//     // finalColor *= pow((MI - i) / MI, 10.);
//   }
// }
