import { Matrix2, Matrix3, Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils.js";

function clampMinAbs(x: number, r: number): number {
  if (Math.abs(x) < r) {
    return x >= 0 ? r : -r;
  }
  return x;
}

function clampMaxAbs(x: number, r: number): number {
  if (Math.abs(x) > r) {
    return x >= 0 ? r : -r;
  }
  return x;
}

declare module "three" {
  interface Matrix3 {
    adjugate(): Matrix3;
  }
  interface Matrix2 {
    determinant(): number;
  }
}

// Matrix2.determinant
(Matrix2.prototype as any).determinant = function () {
  const a = this.elements;
  return a[0] * a[3] - a[1] * a[2];
};

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

export class Hyperplane3 {
  i: Vector3;
  k: number;

  constructor(i: Vector3, k: number) {
    this.i = i;
    this.k = k;
    this.normalize();
  }

  normalize() {
    this.k /= clampMinAbs(this.i.length(), 1e-20);
    this.i.normalize();
  }

  getRepresentativePoint() {
    if (this.i.length() === 0) return new Vector3(1, 0, 0);
    if (this.k === 0) return new Vector3(0, 0, 0);
    const c = this.i.clone().divideScalar(this.k);
    return c.multiplyScalar(1 - Math.sqrt(1 + 1 / c.lengthSq()));
  }
}

export class MobiusGyrovectorSphericalSpace3 {
  // static readonly curvature = 1;
  // static readonly radius = 1;

  static add(P: Vector3, Q: Vector3) {
    const A = P.clone().multiplyScalar(1 - 2 * P.dot(Q) - Q.lengthSq());
    const B = Q.clone().multiplyScalar(1 + P.lengthSq());
    return A.add(B).divideScalar(
      clampMinAbs(1 - 2 * P.dot(Q) + P.lengthSq() * Q.lengthSq(), 1e-20)
    );
  }

  static sub(P: Vector3, Q: Vector3) {
    return MobiusGyrovectorSphericalSpace3.add(Q.clone().negate(), P);
  }

  static getLength(P: Vector3) {
    return 2 * Math.atan(P.length());
  }

  static distance(P: Vector3, Q: Vector3) {
    return 2 * Math.atan(MobiusGyrovectorSphericalSpace3.sub(P, Q).length());
  }

  static mul(r: number, P: Vector3) {
    if (r === 0 || P.length() === 0) return new Vector3(0, 0, 0);
    return P.clone()
      .normalize()
      .multiplyScalar(Math.tan(r * Math.atan(P.length())));
  }

  static normal(P: Vector3) {
    return new Vector3(P.y, -P.x);
  }

  static normalize(P: Vector3) {
    return P.clone().normalize().multiplyScalar(Math.tan(0.5));
  }

  static mix(P: Vector3, Q: Vector3, t: number) {
    return MobiusGyrovectorSphericalSpace3.add(
      P,
      MobiusGyrovectorSphericalSpace3.mul(
        t,
        MobiusGyrovectorSphericalSpace3.sub(Q, P)
      )
    );
  }

  static reflect(V: Vector3, P: Vector3, Q: Vector3, R: Vector3) {
    const h = MobiusGyrovectorSphericalSpace3.hyperplane(P, Q, R);
    const v = V.clone();
    const vDotI = v.dot(h.i);
    const vLengthSq = v.lengthSq();
    const iLengthSq = h.i.lengthSq();

    const numerator = v
      .clone()
      .multiplyScalar(h.k * h.k + iLengthSq)
      .sub(h.i.clone().multiplyScalar(2 * vDotI - h.k * vLengthSq + h.k));

    const denominator = v.clone().multiplyScalar(h.k).sub(h.i).lengthSq();

    return numerator.divideScalar(clampMinAbs(denominator, 1e-20));
  }

  static hyperplane(P: Vector3, Q: Vector3, R: Vector3) {
    const m = new Matrix3(...P.toArray(), ...Q.toArray(), ...R.toArray());
    const det = m.determinant();

    const i = new Vector3(P.lengthSq() - 1, Q.lengthSq() - 1, R.lengthSq() - 1)
      .applyMatrix3(m.adjugate())
      .divideScalar(2);

    return new Hyperplane3(i, det);
  }

  static invertHyperplane(h: Hyperplane3) {
    return new Hyperplane3(h.i.clone().negate(), -h.k);
  }

  static midHyperplane(h1: Hyperplane3, h2: Hyperplane3) {
    const ra = Math.sqrt(h2.i.lengthSq() + h2.k * h2.k);
    const rb = Math.sqrt(h1.i.lengthSq() + h1.k * h1.k);

    const i = h1.i
      .clone()
      .multiplyScalar(ra)
      .add(h2.i.clone().multiplyScalar(rb));
    const k = h1.k * ra + h2.k * rb;

    return new Hyperplane3(i, k);
  }

  // get one of two intersection points of three hyperplanes
  static intersectionPoint(
    h1: Hyperplane3,
    h2: Hyperplane3,
    h3: Hyperplane3,
    P: Vector3 | undefined = undefined
  ) {
    // const i = MobiusGyrovectorSphericalSpace3.intersectionHyperplane(
    //   h1,
    //   h2,
    //   h3
    // ).getRepresentativePoint();

    // if (!P) return i;

    // const j = MobiusGyrovectorSphericalSpace3.antipode(i);
    // const di = MobiusGyrovectorSphericalSpace3.distance(i, P);
    // const dj = MobiusGyrovectorSphericalSpace3.distance(j, P);
    // if (di < dj) return i;
    // return j;

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
    arr.sort((a, b) => a.lengthSq() - b.lengthSq());
    let [T1, T2] = [arr.pop()!, arr.pop()!];
    // T1,T2が一次従属の間，T2をarrから選び出す
    try {
      while (T1.clone().cross(T2).lengthSq() < 1e-10) {
        T2 = arr.pop()!;
      }
    } catch (e) {
      console.log(T1, T2, arr);
      console.log(e);
      throw new Error("Invalid hyperplanes");
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
    const denominator = hP.k * T.lengthSq();

    // 分子の計算
    const dotTiB = T.dot(hP.i);
    const numerator =
      dotTiB + Math.sqrt(dotTiB * dotTiB + hP.k * hP.k * T.lengthSq());

    return T.clone().multiplyScalar(numerator / denominator);
  }

  static intersectionHyperplane(
    h1: Hyperplane3,
    h2: Hyperplane3,
    h3: Hyperplane3
  ) {
    const i1 = h1.i,
      i2 = h2.i,
      i3 = h3.i,
      k1 = h1.k,
      k2 = h2.k,
      k3 = h3.k;
    const g1 = new Matrix2(
      k3 * i2.dot(i2.clone().multiplyScalar(k1).addScaledVector(i1, -k2)),
      k3 * i2.dot(i3.clone().multiplyScalar(k1).addScaledVector(i1, -k3)),
      k2 * i3.dot(i2.clone().multiplyScalar(k1).addScaledVector(i1, -k2)),
      k2 * i3.dot(i3.clone().multiplyScalar(k1).addScaledVector(i1, -k3))
    ).determinant();
    const g2 = new Matrix2(
      k1 * i3.dot(i3.clone().multiplyScalar(k2).addScaledVector(i2, -k3)),
      k1 * i3.dot(i1.clone().multiplyScalar(k2).addScaledVector(i2, -k1)),
      k3 * i1.dot(i3.clone().multiplyScalar(k2).addScaledVector(i2, -k3)),
      k3 * i1.dot(i1.clone().multiplyScalar(k2).addScaledVector(i2, -k1))
    ).determinant();
    const g3 = new Matrix2(
      k2 * i1.dot(i1.clone().multiplyScalar(k3).addScaledVector(i3, -k1)),
      k2 * i1.dot(i2.clone().multiplyScalar(k3).addScaledVector(i3, -k2)),
      k1 * i2.dot(i1.clone().multiplyScalar(k3).addScaledVector(i3, -k1)),
      k1 * i2.dot(i2.clone().multiplyScalar(k3).addScaledVector(i3, -k2))
    ).determinant();

    return new Hyperplane3(
      new Vector3(0, 0, 0)
        .addScaledVector(i1, k2 * k3 * g1)
        .addScaledVector(i2, k3 * k1 * g2)
        .addScaledVector(i3, k1 * k2 * g3),
      k1 * k2 * k3 * (g1 + g2 + g3)
    );
  }

  // 四面体の内心
  static incenter4(P: Vector3, Q: Vector3, R: Vector3, S: Vector3) {
    const Hp = MobiusGyrovectorSphericalSpace3.hyperplane(Q, R, S);
    const Hq = MobiusGyrovectorSphericalSpace3.hyperplane(P, S, R);
    const Hr = MobiusGyrovectorSphericalSpace3.hyperplane(S, P, Q);
    const Hs = MobiusGyrovectorSphericalSpace3.hyperplane(R, Q, P);

    // const Mpq = MobiusGyrovectorSphericalSpace3.midHyperplane(Hp, Hq);
    // const Mpr = MobiusGyrovectorSphericalSpace3.midHyperplane(Hp, Hr);
    // const Mps = MobiusGyrovectorSphericalSpace3.midHyperplane(Hp, Hs);
    const Mpq = MobiusGyrovectorSphericalSpace3.midHyperplane(
      Hp,
      MobiusGyrovectorSphericalSpace3.invertHyperplane(Hq)
    );
    const Mpr = MobiusGyrovectorSphericalSpace3.midHyperplane(
      Hp,
      MobiusGyrovectorSphericalSpace3.invertHyperplane(Hr)
    );
    const Mps = MobiusGyrovectorSphericalSpace3.midHyperplane(
      Hp,
      MobiusGyrovectorSphericalSpace3.invertHyperplane(Hs)
    );

    return MobiusGyrovectorSphericalSpace3.intersectionPoint(Mpq, Mpr, Mps, P);
  }

  // 点が四面体の内部にあるかどうかを判定
  private static isPointInsideTetrahedron(
    point: Vector3,
    P: Vector3,
    Q: Vector3,
    R: Vector3,
    S: Vector3
  ): boolean {
    const Hp = MobiusGyrovectorSphericalSpace3.hyperplane(Q, R, S);
    const Hq = MobiusGyrovectorSphericalSpace3.hyperplane(R, S, P);
    const Hr = MobiusGyrovectorSphericalSpace3.hyperplane(S, P, Q);
    const Hs = MobiusGyrovectorSphericalSpace3.hyperplane(P, Q, R);

    // 各面からの距離の符号をチェック
    const dp = MobiusGyrovectorSphericalSpace3.distanceFromHyperplane(
      point,
      Hp
    );
    const dq = MobiusGyrovectorSphericalSpace3.distanceFromHyperplane(
      point,
      Hq
    );
    const dr = MobiusGyrovectorSphericalSpace3.distanceFromHyperplane(
      point,
      Hr
    );
    const ds = MobiusGyrovectorSphericalSpace3.distanceFromHyperplane(
      point,
      Hs
    );

    // すべての面から同じ側にあるかチェック
    return (
      (dp >= 0 && dq >= 0 && dr >= 0 && ds >= 0) ||
      (dp <= 0 && dq <= 0 && dr <= 0 && ds <= 0)
    );
  }

  // 点から超平面までの距離を計算
  private static distanceFromHyperplane(
    point: Vector3,
    h: Hyperplane3
  ): number {
    return point.dot(h.i) * 2 - h.k * (point.lengthSq() - 1);
  }

  static antipode(P: Vector3) {
    return P.clone().negate().divideScalar(clampMinAbs(P.lengthSq(), 1e-20));
  }

  static mean(...P: Vector3[]) {
    const l = P.map((p) => 2 / (1 + p.lengthSq()));
    const m = l.reduce((a, b) => a + b, 0) - l.length;
    const V = new Vector3(0, 0, 0);
    for (let i = 0; i < P.length; i++) {
      V.add(P[i].clone().multiplyScalar(l[i]));
    }
    const A = MobiusGyrovectorSphericalSpace3.mul(
      0.5,
      V.divideScalar(clampMinAbs(m, 1e-20))
    );
    const B = MobiusGyrovectorSphericalSpace3.antipode(A);
    return MobiusGyrovectorSphericalSpace3.distance(P[0], A) <
      MobiusGyrovectorSphericalSpace3.distance(P[0], B)
      ? A
      : B;
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
