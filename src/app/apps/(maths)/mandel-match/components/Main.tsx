"use client";

import { CircleCheck, Dices, Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Vector2 } from "three";
import GraphMgr from "@/src/GraphMgr";
import { overlapScorePercent } from "../lib/regionScore";
import { pickTargetCenter } from "../lib/pickTargetCenter";
import MandelCanvas, {
  MANDEL_MATCH_BASE_RADIUS,
  MANDEL_MATCH_MAX_ITER,
} from "./MandelCanvas";

const ZOOM_RATIO = Math.SQRT2;
const TARGET_ZOOM_MIN = 2;
const TARGET_ZOOM_MAX = 512;
const TARGET_ZOOM_DEFAULT = 10;

const controlButtonClass =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border-2 border-[var(--border-color)] bg-[var(--background-color)] text-[var(--text-color)] hover:scale-95 active:invert";

const iconProps = {
  className: "h-4 w-4 shrink-0",
  strokeWidth: 2,
  "aria-hidden": true as const,
};

function buildTargetGraph(zoomFactor: number): GraphMgr {
  const r = MANDEL_MATCH_BASE_RADIUS / zoomFactor;
  const { x, y } = pickTargetCenter({
    maxIter: MANDEL_MATCH_MAX_ITER,
    targetRadius: r,
  });
  return new GraphMgr(new Vector2(x, y), r);
}

function formatScale(n: number): string {
  if (!Number.isFinite(n) || n <= 0) {
    return "—";
  }
  const a = Math.abs(n);
  if (a >= 1e4 || (a < 0.01 && a > 0)) {
    return n.toExponential(2);
  }
  if (a >= 100) {
    return `${Math.round(n)}`;
  }
  if (a >= 10) {
    return n.toFixed(1);
  }
  return n.toFixed(2);
}

export default function Main() {
  const [targetZoomFactor, setTargetZoomFactor] = useState(TARGET_ZOOM_DEFAULT);
  const [targetGraph, setTargetGraph] = useState(() =>
    buildTargetGraph(TARGET_ZOOM_DEFAULT),
  );
  const [userGraph, setUserGraph] = useState(() => new GraphMgr());
  const [interactionEpoch, setInteractionEpoch] = useState(0);
  const [judgedScore, setJudgedScore] = useState<number | null>(null);

  const skipZoomEffect = useRef(true);

  useEffect(() => {
    if (skipZoomEffect.current) {
      skipZoomEffect.current = false;
      return;
    }
    setTargetGraph(buildTargetGraph(targetZoomFactor));
    setUserGraph(new GraphMgr());
    setJudgedScore(null);
    setInteractionEpoch((n) => n + 1);
  }, [targetZoomFactor]);

  const onUserGraphChange = useCallback((g: GraphMgr) => {
    setUserGraph(g);
    setJudgedScore(null);
    setInteractionEpoch((n) => n + 1);
  }, []);

  void interactionEpoch;
  const userMag = MANDEL_MATCH_BASE_RADIUS / userGraph.radius;

  const newTarget = useCallback(() => {
    setTargetGraph(buildTargetGraph(targetZoomFactor));
    setUserGraph(new GraphMgr());
    setJudgedScore(null);
    setInteractionEpoch((n) => n + 1);
  }, [targetZoomFactor]);

  const resetView = useCallback(() => {
    setUserGraph(new GraphMgr());
    setJudgedScore(null);
    setInteractionEpoch((n) => n + 1);
  }, []);

  const bumpTargetZoom = useCallback((dir: "in" | "out") => {
    setTargetZoomFactor((prev) => {
      const next = dir === "in" ? prev * ZOOM_RATIO : prev / ZOOM_RATIO;
      return Math.min(TARGET_ZOOM_MAX, Math.max(TARGET_ZOOM_MIN, next));
    });
  }, []);

  const judge = useCallback(() => {
    setJudgedScore(overlapScorePercent(targetGraph, userGraph));
  }, [userGraph, targetGraph]);

  return (
    <main className="flex h-[calc(100vh-var(--header-height))] flex-col overflow-hidden bg-[var(--background-color)] text-[var(--text-color)] md:flex-row">
      <section className="flex min-h-[40vh] flex-1 flex-col border-b-2 border-[var(--border-color)] md:min-h-0 md:border-b-0 md:border-r-2">
        <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] px-3 py-2 font-mono text-sm tabular-nums">
          <span>×{formatScale(targetZoomFactor)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={controlButtonClass}
              title="Zoom out (÷√2)"
              onClick={() => bumpTargetZoom("out")}
            >
              <Minus {...iconProps} />
            </button>
            <button
              type="button"
              className={controlButtonClass}
              title="Zoom in (×√2)"
              onClick={() => bumpTargetZoom("in")}
            >
              <Plus {...iconProps} />
            </button>
            <button
              type="button"
              className={controlButtonClass}
              title="New target"
              onClick={newTarget}
            >
              <Dices {...iconProps} />
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1">
          <MandelCanvas graph={targetGraph} interactive={false} />
        </div>
      </section>
      <section className="flex min-h-[40vh] flex-1 flex-col md:min-h-0">
        <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] px-3 py-2 font-mono text-sm tabular-nums">
          <div className="flex flex-wrap items-center gap-2">
            <span>×{formatScale(userMag)}</span>
            <button
              type="button"
              className={controlButtonClass}
              title="Reset view"
              onClick={resetView}
            >
              <RotateCcw {...iconProps} />
            </button>
            <button
              type="button"
              className={controlButtonClass}
              title="Score"
              onClick={judge}
            >
              <CircleCheck {...iconProps} />
            </button>
          </div>
          <span className="opacity-90">
            {judgedScore !== null ? judgedScore : "—"}
          </span>
        </header>
        <div className="relative min-h-0 flex-1">
          <MandelCanvas
            graph={userGraph}
            onGraphChange={onUserGraphChange}
            interactive
          />
        </div>
      </section>
    </main>
  );
}
