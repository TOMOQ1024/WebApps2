/**
 * マンデルブロ集合の境界付近を偏らせるため，逃走吧回数が帯域内になるまで乱数棄却する．
 * さらに，ターゲット表示スケールで近傍に輪郭（反復回数の変化）が見えるよう，
 * 周囲サンプル間のばらつきが小さい候補は棄却する．
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

/** 複素平面上でターゲットビューの半径（GraphMgr.radius に相当） */
const DEFAULT_TARGET_RADIUS = 0.2;

/** 近傍サンプル間隔 = targetRadius × この係数 */
const NEIGHBOR_DELTA_FACTOR = 0.09;

/**
 * 中心と周囲 8 点の反復回数の最大最小差．
 * 小さいと「境界付近だがこの倍率ではほぼ一色」の領域になりやすい．
 */
function iterationSpreadAt(
  cx: number,
  cy: number,
  delta: number,
  maxIter: number,
): number {
  const offs: [number, number][] = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  let lo = maxIter;
  let hi = 0;
  for (const [a, b] of offs) {
    const n = mandelbrotEscapeIterations(
      cx + a * delta,
      cy + b * delta,
      maxIter,
    );
    lo = Math.min(lo, n);
    hi = Math.max(hi, n);
  }
  return hi - lo;
}

function hasVisibleContourAtScale(
  cx: number,
  cy: number,
  targetRadius: number,
  maxIter: number,
  minSpread: number,
): boolean {
  const delta = Math.max(targetRadius * NEIGHBOR_DELTA_FACTOR, 1e-7);
  const spread = iterationSpreadAt(cx, cy, delta, maxIter);
  if (spread < minSpread) {
    return false;
  }
  const n0 = mandelbrotEscapeIterations(cx, cy, maxIter);
  if (n0 >= maxIter) {
    return false;
  }
  return true;
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
  /**
   * ターゲット表示の複素半径（BASE_RADIUS / zoomFactor）．
   * 未指定時は 0.2 前後を想定した既定値．
   */
  targetRadius?: number;
  /** 近傍反復回数の最小スパン（棄却しきれないときは自動で緩める） */
  minNeighborSpread?: number;
};

const DEFAULT_RE_MIN = -2.2;
const DEFAULT_RE_MAX = 0.8;
const DEFAULT_IM_MIN = -1.25;
const DEFAULT_IM_MAX = 1.25;

const FALLBACK = { x: -0.7435669, y: 0.1318253 };

export function pickTargetCenter(options: PickTargetOptions = {}): {
  x: number;
  y: number;
} {
  const maxIter = options.maxIter ?? 256;
  const maxAttempts = options.maxAttempts ?? 1200;
  const minEscape = options.minEscape ?? 8;
  const reMin = options.reMin ?? DEFAULT_RE_MIN;
  const reMax = options.reMax ?? DEFAULT_RE_MAX;
  const imMin = options.imMin ?? DEFAULT_IM_MIN;
  const imMax = options.imMax ?? DEFAULT_IM_MAX;
  const targetRadius = options.targetRadius ?? DEFAULT_TARGET_RADIUS;
  const minSpreadRequested = options.minNeighborSpread ?? 12;

  const tryPick = (spreadThreshold: number): { x: number; y: number } | null => {
    for (let a = 0; a < maxAttempts; a++) {
      const x = reMin + Math.random() * (reMax - reMin);
      const y = imMin + Math.random() * (imMax - imMin);
      const n = mandelbrotEscapeIterations(x, y, maxIter);
      if (n < minEscape || n >= maxIter) {
        continue;
      }
      if (
        !hasVisibleContourAtScale(x, y, targetRadius, maxIter, spreadThreshold)
      ) {
        continue;
      }
      return { x, y };
    }
    return null;
  };

  const strict = tryPick(minSpreadRequested);
  if (strict) {
    return strict;
  }
  const relaxed = tryPick(Math.max(6, Math.floor(minSpreadRequested / 2)));
  if (relaxed) {
    return relaxed;
  }

  return FALLBACK;
}
