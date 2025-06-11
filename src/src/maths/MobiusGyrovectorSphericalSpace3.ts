import { Matrix2, Matrix3, Vector3 } from "three";

const EPSILON = 1e-10;

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

  static fromPoints(P: Vector3, Q: Vector3, R: Vector3) {
    const m = new Matrix3(...P.toArray(), ...Q.toArray(), ...R.toArray());
    const det = m.determinant();

    const i = new Vector3(P.lengthSq() - 1, Q.lengthSq() - 1, R.lengthSq() - 1)
      .applyMatrix3(m.adjugate())
      .divideScalar(2);

    return new Hyperplane3(i, clampMinAbs(det, EPSILON));
  }

  normalize() {
    if (!this.i.length()) {
      this.k = 1;
      return;
    }
    this.k /= clampMinAbs(this.i.length(), EPSILON);
    this.i.normalize();
  }

  getRepresentativePoint() {
    if (this.i.length() === 0) return new Vector3(1, 0, 0);
    if (this.k === 0) return new Vector3(0, 0, 0);
    const c = this.i.clone().divideScalar(this.k);
    return c.multiplyScalar(1 - Math.sqrt(1 + 1 / c.lengthSq()));
  }

  inverted() {
    return new Hyperplane3(this.i.clone().negate(), -this.k);
  }

  distance(P: Vector3) {
    return P.dot(this.i) * 2 - this.k * (P.lengthSq() - 1);
  }
}

export class MobiusGyrovectorSphericalSpace3 {
  static add(P: Vector3, Q: Vector3) {
    const A = P.clone().multiplyScalar(1 - 2 * P.dot(Q) - Q.lengthSq());
    const B = Q.clone().multiplyScalar(1 + P.lengthSq());
    return A.add(B).divideScalar(
      clampMinAbs(1 - 2 * P.dot(Q) + P.lengthSq() * Q.lengthSq(), EPSILON)
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
    const h = Hyperplane3.fromPoints(P, Q, R);
    const v = V.clone();
    const vDotI = v.dot(h.i);
    const vLengthSq = v.lengthSq();
    const iLengthSq = h.i.lengthSq();

    const numerator = v
      .clone()
      .multiplyScalar(h.k * h.k + iLengthSq)
      .sub(h.i.clone().multiplyScalar(2 * vDotI - h.k * vLengthSq + h.k));

    const denominator = v.clone().multiplyScalar(h.k).sub(h.i).lengthSq();

    return numerator.divideScalar(clampMinAbs(denominator, EPSILON));
  }

  static midHyperplane(h1: Hyperplane3, h2: Hyperplane3) {
    const ra = Math.sqrt(h2.i.lengthSq() + h2.k * h2.k);
    const rb = Math.sqrt(h1.i.lengthSq() + h1.k * h1.k);

    const i = new Vector3(0, 0, 0)
      .addScaledVector(h1.i, ra)
      .addScaledVector(h2.i, rb);
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
    const i = MobiusGyrovectorSphericalSpace3.intersectionHyperplane(
      h1,
      h2,
      h3
    ).getRepresentativePoint();

    if (!P) return i;

    const j = MobiusGyrovectorSphericalSpace3.antipode(i);
    const di = MobiusGyrovectorSphericalSpace3.distance(i, P);
    const dj = MobiusGyrovectorSphericalSpace3.distance(j, P);
    let r = new Vector3(0, 0, 0);
    if (di < dj) r = i;
    else r = j;
    // console.log("distance to point");
    // console.log(i);
    // console.log(di);
    // console.log(j);
    // console.log(dj);
    // console.log(r);
    // console.log("distance to hyperplanes");
    // console.log(h1.distance(i));
    // console.log(h2.distance(i));
    // console.log(h3.distance(i));
    // console.log(h3.distance(j));
    // console.log(h2.distance(j));
    // console.log(h3.distance(j));
    return r;
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
      i2.dot(i2.clone().multiplyScalar(k1).addScaledVector(i1, -k2)),
      i2.dot(i3.clone().multiplyScalar(k1).addScaledVector(i1, -k3)),
      i3.dot(i2.clone().multiplyScalar(k1).addScaledVector(i1, -k2)),
      i3.dot(i3.clone().multiplyScalar(k1).addScaledVector(i1, -k3))
    ).determinant();
    const g2 = new Matrix2(
      i3.dot(i3.clone().multiplyScalar(k2).addScaledVector(i2, -k3)),
      i3.dot(i1.clone().multiplyScalar(k2).addScaledVector(i2, -k1)),
      i1.dot(i3.clone().multiplyScalar(k2).addScaledVector(i2, -k3)),
      i1.dot(i1.clone().multiplyScalar(k2).addScaledVector(i2, -k1))
    ).determinant();
    const g3 = new Matrix2(
      i1.dot(i1.clone().multiplyScalar(k3).addScaledVector(i3, -k1)),
      i1.dot(i2.clone().multiplyScalar(k3).addScaledVector(i3, -k2)),
      i2.dot(i1.clone().multiplyScalar(k3).addScaledVector(i3, -k1)),
      i2.dot(i2.clone().multiplyScalar(k3).addScaledVector(i3, -k2))
    ).determinant();

    const ig = new Vector3(0, 0, 0)
      .addScaledVector(i1, g1 / k1)
      .addScaledVector(i2, g2 / k2)
      .addScaledVector(i3, g3 / k3);
    const kg = g1 + g2 + g3;

    // console.log("in");
    // console.log(i1, i2, i3);
    // console.log("kn");
    // console.log(k1, k2, k3);
    // console.log("ig,kg");
    // console.log(ig, kg);
    // console.log("dot(expected 0,0,0)");
    // console.log(
    //   ig.dot(ig.clone().multiplyScalar(k1).sub(i1.clone().multiplyScalar(kg))),
    //   ig.dot(ig.clone().multiplyScalar(k2).sub(i2.clone().multiplyScalar(kg))),
    //   ig.dot(ig.clone().multiplyScalar(k3).sub(i3.clone().multiplyScalar(kg)))
    // );

    return new Hyperplane3(ig, kg);
  }

  // 四面体の内心
  static incenter4(P: Vector3, Q: Vector3, R: Vector3, S: Vector3) {
    const Hp = Hyperplane3.fromPoints(Q, R, S);
    const Hq = Hyperplane3.fromPoints(P, S, R);
    const Hr = Hyperplane3.fromPoints(S, P, Q);
    const Hs = Hyperplane3.fromPoints(R, Q, P);

    // const Mpq = MobiusGyrovectorSphericalSpace3.midHyperplane(Hp, Hq);
    // const Mpr = MobiusGyrovectorSphericalSpace3.midHyperplane(Hp, Hr);
    // const Mps = MobiusGyrovectorSphericalSpace3.midHyperplane(Hp, Hs);
    const Mpq = MobiusGyrovectorSphericalSpace3.midHyperplane(
      Hp,
      Hq.inverted()
    );
    const Mpr = MobiusGyrovectorSphericalSpace3.midHyperplane(
      Hp,
      Hr.inverted()
    );
    const Mps = MobiusGyrovectorSphericalSpace3.midHyperplane(
      Hp,
      Hs.inverted()
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
    const Hp = Hyperplane3.fromPoints(Q, R, S);
    const Hq = Hyperplane3.fromPoints(R, S, P);
    const Hr = Hyperplane3.fromPoints(S, P, Q);
    const Hs = Hyperplane3.fromPoints(P, Q, R);

    // 各面からの距離の符号をチェック
    const dp = Hp.distance(point);
    const dq = Hq.distance(point);
    const dr = Hr.distance(point);
    const ds = Hs.distance(point);

    // すべての面から同じ側にあるかチェック
    return (
      (dp >= 0 && dq >= 0 && dr >= 0 && ds >= 0) ||
      (dp <= 0 && dq <= 0 && dr <= 0 && ds <= 0)
    );
  }

  static antipode(P: Vector3) {
    return P.clone().negate().divideScalar(clampMinAbs(P.lengthSq(), EPSILON));
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
      V.divideScalar(clampMinAbs(m, EPSILON))
    );
    const B = MobiusGyrovectorSphericalSpace3.antipode(A);
    return MobiusGyrovectorSphericalSpace3.distance(P[0], A) <
      MobiusGyrovectorSphericalSpace3.distance(P[0], B)
      ? A
      : B;
  }
}
