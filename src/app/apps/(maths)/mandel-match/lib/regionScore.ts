import type GraphMgr from "@/shared/graph/GraphMgr";

/**
 * GraphMgr はシェーダで複素座標が ~ radius スケールで動くため，
 * 表示領域・回答領域を複素平面上の軸平行正方形
 * [ox - r, ox + r] × [oy - r, oy + r] とみなす（origin, radius のみ．ピクセルに依存しない）．
 */

function axisAlignedRectIntersectionArea(
  ax0: number,
  ax1: number,
  ay0: number,
  ay1: number,
  bx0: number,
  bx1: number,
  by0: number,
  by1: number,
): number {
  const ix0 = Math.max(ax0, bx0);
  const ix1 = Math.min(ax1, bx1);
  const iy0 = Math.max(ay0, by0);
  const iy1 = Math.min(ay1, by1);
  if (ix0 >= ix1 || iy0 >= iy1) {
    return 0;
  }
  return (ix1 - ix0) * (iy1 - iy0);
}

/**
 * IoU = area(T ∩ U) / area(T ∪ U)．一致で 1，不交差で 0．
 */
function viewRegionIou(target: GraphMgr, user: GraphMgr): number {
  const tx0 = target.origin.x - target.radius;
  const tx1 = target.origin.x + target.radius;
  const ty0 = target.origin.y - target.radius;
  const ty1 = target.origin.y + target.radius;

  const ux0 = user.origin.x - user.radius;
  const ux1 = user.origin.x + user.radius;
  const uy0 = user.origin.y - user.radius;
  const uy1 = user.origin.y + user.radius;

  const inter = axisAlignedRectIntersectionArea(
    tx0,
    tx1,
    ty0,
    ty1,
    ux0,
    ux1,
    uy0,
    uy1,
  );

  const at = (tx1 - tx0) * (ty1 - ty0);
  const au = (ux1 - ux0) * (uy1 - uy0);
  const uni = at + au - inter;

  if (!Number.isFinite(uni) || uni <= 0) {
    return 0;
  }
  return inter / uni;
}

/** 0–100 */
export function overlapScorePercent(target: GraphMgr, user: GraphMgr): number {
  const iou = viewRegionIou(target, user);
  return Math.ceil(100 * Math.min(1, Math.max(0, iou)));
}
