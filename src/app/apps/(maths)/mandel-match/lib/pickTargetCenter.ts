/**
 * マンデルブロ集合の境界付近を偏らせるため，逃走吧回数が帯域内になるまで乱数棄却する．
 */
export function mandelbrotEscapeIterations(
  cx: number,
  cy: number,
  maxIter: number,
): number {
  let zx = 0;
  let zy = 0;
  for (let i = 0; i < maxIter; i++) {
    const x2 = zx * zx;
    const y2 = zy * zy;
    if (x2 + y2 > 4) {
      return i;
    }
    zy = 2 * zx * zy + cy;
    zx = x2 - y2 + cx;
  }
  return maxIter;
}

export type PickTargetOptions = {
  maxIter?: number;
  maxAttempts?: number;
  /** この回数以上で外に出た点を採用（細かすぎる芽を減らす） */
  minEscape?: number;
  /** 実部の範囲 */
  reMin?: number;
  reMax?: number;
  /** 虚部の範囲 */
  imMin?: number;
  imMax?: number;
};

const DEFAULT_RE_MIN = -2.2;
const DEFAULT_RE_MAX = 0.8;
const DEFAULT_IM_MIN = -1.25;
const DEFAULT_IM_MAX = 1.25;

export function pickTargetCenter(options: PickTargetOptions = {}): {
  x: number;
  y: number;
} {
  const maxIter = options.maxIter ?? 256;
  const maxAttempts = options.maxAttempts ?? 800;
  const minEscape = options.minEscape ?? 8;
  const reMin = options.reMin ?? DEFAULT_RE_MIN;
  const reMax = options.reMax ?? DEFAULT_RE_MAX;
  const imMin = options.imMin ?? DEFAULT_IM_MIN;
  const imMax = options.imMax ?? DEFAULT_IM_MAX;

  for (let a = 0; a < maxAttempts; a++) {
    const x = reMin + Math.random() * (reMax - reMin);
    const y = imMin + Math.random() * (imMax - imMin);
    const n = mandelbrotEscapeIterations(x, y, maxIter);
    if (n >= minEscape && n < maxIter) {
      return { x, y };
    }
  }

  return { x: -0.7435669, y: 0.1318253 };
}
