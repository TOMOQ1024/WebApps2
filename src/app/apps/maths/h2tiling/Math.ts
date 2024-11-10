import { Matrix3, Vector2 } from "three";

export function h2t_generate_uniform(A: number, B: number, C: number) {
  // console.log(`generating uniforms for [(${A},${B},${C})]...`);
  const v = h2t_newton_solve2(
    (v: Vector2) => {
      const p = new Vector2(0, 0);
      const q = new Vector2(v.x, 0);
      const r = new Vector2(
        Math.cos(Math.PI / A),
        Math.sin(Math.PI / A)
      ).multiplyScalar(v.y);
      return h2t_get_label(p, q, r) - B;
    },
    (v: Vector2) => {
      const alpha = 2;
      const p = new Vector2(0, 0);
      const q = new Vector2(v.x, 0);
      const r = new Vector2(
        Math.cos(Math.PI / A),
        Math.sin(Math.PI / A)
      ).multiplyScalar(v.y);
      return h2t_get_label(q, r, p) - C;
    }
  );
  const p = new Vector2(v.x, 0);
  const q = new Vector2(
    Math.cos(Math.PI / A),
    Math.sin(Math.PI / A)
  ).multiplyScalar(v.y);
  const i = h2t_i(p, q);
  const j = h2t_j(p, q);
  const k = h2t_k(p, q);
  // console.log(`uniforms for [(${A},${B},${C})] generated!`);
  return {
    A,
    C: new Vector2(i, j).divideScalar(2 * k).toArray(),
    R: Math.sqrt((i * i + j * j) / (4 * k * k) - 1),
  };
}

/**
 * ℝ²→ℝ の関数 f,g の共通する零点を求める
 */
export function h2t_newton_solve2(
  f: (v: Vector2) => number,
  g: (v: Vector2) => number,
  options = {
    iterationLimit: 20,
    v0: new Vector2(0.999, 0.999),
    error: 1e-6,
    lim0: 1e-6,
  }
) {
  function fx(v: Vector2) {
    return (f(v.clone().add({ x: options.lim0, y: 0 })) - f(v)) / options.lim0;
  }
  function fy(v: Vector2) {
    return (f(v.clone().add({ x: 0, y: options.lim0 })) - f(v)) / options.lim0;
  }
  function gx(v: Vector2) {
    return (g(v.clone().add({ x: options.lim0, y: 0 })) - g(v)) / options.lim0;
  }
  function gy(v: Vector2) {
    return (g(v.clone().add({ x: 0, y: options.lim0 })) - g(v)) / options.lim0;
  }

  const v0 = options.v0.clone();
  const v1 = options.v0.clone();
  let val0 = f(v0) ** 2 + g(v0) ** 2;
  let val1: number;
  for (let i = 0; i < options.iterationLimit; i++) {
    // console.log(`v_${i}: ${Math.abs(val0)}`);
    v1.sub(
      new Vector2(f(v0), g(v0)).applyMatrix3(
        new Matrix3(fx(v0), fy(v0), 0, gx(v0), gy(v0), 0, 0, 0, 1).invert()
      )
    );
    val1 = f(v1) ** 2 + g(v1) ** 2;
    if (Math.abs(val1) < options.lim0) return v1;
    v0.copy(v1);
    val0 = val1;
    if (i === options.iterationLimit - 1)
      throw new Error(`Failed to Solve. val0: ${val0},val1: ${val1}`);
  }
  // console.log(`v_${options.iterationLimit}: ${Math.abs(val0)}`);
  return v1;
}

/**
 * ∠pqr の角度が 180º の何分の一の大きさかを返す．
 */
export function h2t_get_label(p: Vector2, q: Vector2, r: Vector2) {
  const i1 = h2t_i(p, q);
  const j1 = h2t_j(p, q);
  const k1 = h2t_k(p, q);
  const i2 = h2t_i(q, r);
  const j2 = h2t_j(q, r);
  const k2 = h2t_k(q, r);
  const t = Math.acos(
    (i1 * i2 + j1 * j2 - 4 * k1 * k2) /
      (Math.sqrt(i1 * i1 + j1 * j1 - 4 * k1 * k1) *
        Math.sqrt(i2 * i2 + j2 * j2 - 4 * k2 * k2))
  );
  return 1 / (1 / 2 - Math.abs(t / Math.PI - 1 / 2));
}

export function h2t_imf(p: Vector2, q: Vector2, v: Vector2) {
  return (
    h2t_k(p, q) * (v.lengthSq() + 1) - h2t_i(p, q) * v.x - h2t_j(p, q) * v.y
  );
}

/**
 * p,qを通り，単位円に直行する円
 * 中心：(i,j)/2k
 * 半径：√((ii+jj)/(4kk)-1)
 */
export function h2t_i(p: Vector2, q: Vector2) {
  return q.y * (p.lengthSq() + 1) - p.y * (q.lengthSq() + 1);
}

export function h2t_j(p: Vector2, q: Vector2) {
  return p.x * (q.lengthSq() + 1) - q.x * (p.lengthSq() + 1);
}

export function h2t_k(p: Vector2, q: Vector2) {
  return p.x * q.y - p.y * q.x;
}
