import { ArrowRight, ZoomIn, ZoomOut } from "lucide-react";
import type GraphMgr from "@/shared/graph/GraphMgr";

type HintOverlayProps = {
  target: GraphMgr;
  user: GraphMgr;
};

const PAN_DIST_MIN = 1e-12;
const ZOOM_LOG_EPS = 0.03;

/** この範囲内ならヒントは出さない（位置・倍率が十分近い） */
const CLOSE_ORIGIN_FRAC = 0.035;
const CLOSE_LOG_RADIUS = 0.05;

function isNearlySolved(user: GraphMgr, target: GraphMgr): boolean {
  const d = user.origin.distanceTo(target.origin);
  const lr = Math.abs(Math.log(user.radius) - Math.log(target.radius));
  return d < target.radius * CLOSE_ORIGIN_FRAC && lr < CLOSE_LOG_RADIUS;
}

/**
 * ターゲット中心が現在の視野中心よりどちらにあるか（パン），
 * 半径が合っているか（ズーム）を示す．座標は GraphMgr のみ（ピクセル非依存）．
 */
export default function HintOverlay({ target, user }: HintOverlayProps) {
  if (isNearlySolved(user, target)) {
    return null;
  }

  const dx = target.origin.x - user.origin.x;
  const dy = target.origin.y - user.origin.y;
  const dist = Math.hypot(dx, dy);
  const scaleRef = Math.max(target.radius, user.radius, 1e-15);
  const showPan = dist > Math.max(PAN_DIST_MIN, scaleRef * 1e-9);

  /* 画面上のターゲット方向 (x 右, y 下) は複素 (dx,dy) に対し (dx,-dy)．ArrowRight 基準で atan2(-dy,dx) */
  const angleDeg = (Math.atan2(-dy, dx) * 180) / Math.PI;

  const logRatio = Math.log(user.radius) - Math.log(target.radius);
  const needZoomIn = logRatio > ZOOM_LOG_EPS;
  const needZoomOut = logRatio < -ZOOM_LOG_EPS;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {showPan ? (
          <div
            className="text-[var(--text-color)] opacity-85"
            style={{ transform: `rotate(${angleDeg}deg)` }}
          >
            <ArrowRight className="h-14 w-14" strokeWidth={2} aria-hidden />
          </div>
        ) : (
          <span className="font-mono text-sm opacity-50" aria-hidden>
            —
          </span>
        )}
        <div className="flex h-8 items-center justify-center gap-2">
          {needZoomIn ? (
            <ZoomIn
              className="h-7 w-7 text-[var(--text-color)] opacity-85"
              strokeWidth={2}
              aria-hidden
            />
          ) : null}
          {needZoomOut ? (
            <ZoomOut
              className="h-7 w-7 text-[var(--text-color)] opacity-85"
              strokeWidth={2}
              aria-hidden
            />
          ) : null}
          {!needZoomIn && !needZoomOut ? (
            <span className="font-mono text-sm opacity-40" aria-hidden>
              —
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
