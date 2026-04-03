"use client";

import {
  CircleCheck,
  Crosshair,
  Dices,
  Lightbulb,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Vector2 } from "three";
import GraphMgr from "@/src/GraphMgr";
import { pickTargetCenter } from "../lib/pickTargetCenter";
import { overlapScorePercent } from "../lib/regionScore";
import HintOverlay from "./HintOverlay";
import MandelCanvas, {
  MANDEL_MATCH_BASE_RADIUS,
  MANDEL_MATCH_MAX_ITER,
  type MandelResultTint,
} from "./MandelCanvas";

const ZOOM_RATIO = Math.SQRT2;
const TARGET_ZOOM_MIN = 3;
const TARGET_ZOOM_MAX = 513;
const TARGET_ZOOM_DEFAULT = 4;

function targetZoomFactorFromStep(step: number): number {
  return TARGET_ZOOM_DEFAULT * ZOOM_RATIO ** step;
}

const TARGET_ZOOM_STEP_BOUNDS = (() => {
  const lnR = Math.log(ZOOM_RATIO);
  const min = Math.ceil(Math.log(TARGET_ZOOM_MIN / TARGET_ZOOM_DEFAULT) / lnR);
  const max = Math.floor(Math.log(TARGET_ZOOM_MAX / TARGET_ZOOM_DEFAULT) / lnR);
  return { min, max };
})();

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

function userResultTint(
  score: number | null,
  hintUsed: boolean | null,
): MandelResultTint {
  if (score === null || hintUsed === null) {
    return "default";
  }
  if (hintUsed) {
    return "yellow";
  }
  if (score >= 80) {
    return "green";
  }
  if (score > 0) {
    return "orange";
  }
  return "red";
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
  const [targetZoomStep, setTargetZoomStep] = useState(0);
  const targetZoomFactor = targetZoomFactorFromStep(targetZoomStep);
  const [targetGraph, setTargetGraph] = useState(() =>
    buildTargetGraph(TARGET_ZOOM_DEFAULT),
  );
  const [userGraph, setUserGraph] = useState(() => new GraphMgr());
  const [interactionEpoch, setInteractionEpoch] = useState(0);
  const [judgedScore, setJudgedScore] = useState<number | null>(null);
  const [judgedHintUsed, setJudgedHintUsed] = useState<boolean | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  /** このターゲット中に一度でもヒントを開いたら true（採点時にスナップショット） */
  const hintUsedRef = useRef(false);
  /** 同一ターゲットで最初の採点が決めた着色（再採点では更新しない） */
  const lockedScoredTintRef = useRef<MandelResultTint | null>(null);
  const [challengeKey, setChallengeKey] = useState(0);

  const skipZoomEffect = useRef(true);

  useEffect(() => {
    if (skipZoomEffect.current) {
      skipZoomEffect.current = false;
      return;
    }
    setTargetGraph(buildTargetGraph(targetZoomFactor));
    setUserGraph(new GraphMgr());
    setJudgedScore(null);
    setJudgedHintUsed(null);
    hintUsedRef.current = false;
    lockedScoredTintRef.current = null;
    setHintOpen(false);
    setChallengeKey((k) => k + 1);
    setInteractionEpoch((n) => n + 1);
  }, [targetZoomFactor]);

  const onUserGraphChange = useCallback((g: GraphMgr) => {
    setUserGraph(g);
    setInteractionEpoch((n) => n + 1);
  }, []);

  void interactionEpoch;
  const userMag = MANDEL_MATCH_BASE_RADIUS / userGraph.radius;

  /** 採点前はヒント利用状況に応じて黄色．採点後は初回採点の色を同一ターゲット中ずっと固定 */
  const interactiveTint = useMemo((): MandelResultTint => {
    if (judgedScore !== null) {
      return (
        lockedScoredTintRef.current ??
        userResultTint(judgedScore, judgedHintUsed ?? false)
      );
    }
    if (hintOpen || hintUsedRef.current) {
      return "yellow";
    }
    return "default";
  }, [judgedScore, judgedHintUsed, hintOpen]);

  const newTarget = useCallback(() => {
    setTargetGraph(buildTargetGraph(targetZoomFactor));
    setUserGraph(new GraphMgr());
    setJudgedScore(null);
    setJudgedHintUsed(null);
    hintUsedRef.current = false;
    lockedScoredTintRef.current = null;
    setHintOpen(false);
    setChallengeKey((k) => k + 1);
    setInteractionEpoch((n) => n + 1);
  }, [targetZoomFactor]);

  const resetView = useCallback(() => {
    setUserGraph(new GraphMgr());
    setInteractionEpoch((n) => n + 1);
  }, []);

  /** 表示倍率のみ目的側の targetZoomFactor に合わせる（中心は維持） */
  const matchUserZoomToTarget = useCallback(() => {
    setUserGraph((prev) => {
      const r = MANDEL_MATCH_BASE_RADIUS / targetZoomFactor;
      return new GraphMgr(prev.origin.clone(), r);
    });
    setInteractionEpoch((n) => n + 1);
  }, [targetZoomFactor]);

  const bumpTargetZoom = useCallback((dir: "in" | "out") => {
    setTargetZoomStep((prev) => {
      const next = dir === "in" ? prev + 1 : prev - 1;
      return Math.min(
        TARGET_ZOOM_STEP_BOUNDS.max,
        Math.max(TARGET_ZOOM_STEP_BOUNDS.min, next),
      );
    });
  }, []);

  const judge = useCallback(() => {
    const score = overlapScorePercent(targetGraph, userGraph);
    const hint = hintUsedRef.current;
    setJudgedScore(score);
    setJudgedHintUsed(hint);
    if (lockedScoredTintRef.current === null) {
      lockedScoredTintRef.current = userResultTint(score, hint);
    }
  }, [userGraph, targetGraph]);

  return (
    <main className="flex h-[calc(100vh-var(--header-height))] flex-col overflow-hidden bg-[var(--background-color)] text-[var(--text-color)] md:flex-row">
      <section className="flex min-h-[40vh] flex-1 flex-col border-b-2 border-[var(--border-color)] md:min-h-0 md:border-b-0 md:border-r-2">
        <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] px-3 py-2 font-mono text-sm tabular-nums">
          <span>×{formatScale(targetZoomFactor)}</span>
          <div className="flex flex-wrap items-center justify-end gap-2">
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
          <span>×{formatScale(userMag)}</span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className={controlButtonClass}
              title="目的の倍率に合わせる"
              onClick={matchUserZoomToTarget}
            >
              <Crosshair {...iconProps} />
            </button>
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
            <button
              type="button"
              className={`${controlButtonClass} ${hintOpen ? "ring-2 ring-[var(--text-color)] ring-offset-2 ring-offset-[var(--background-color)]" : ""}`}
              title="Hint"
              aria-pressed={hintOpen}
              onClick={() => {
                setHintOpen((v) => {
                  const next = !v;
                  if (next) {
                    hintUsedRef.current = true;
                  }
                  return next;
                });
              }}
            >
              <Lightbulb {...iconProps} />
            </button>
          </div>
        </header>
        <div className="relative min-h-0 flex-1">
          <MandelCanvas
            key={challengeKey}
            graph={userGraph}
            onGraphChange={onUserGraphChange}
            interactive
            resultTint={interactiveTint}
          />
          {judgedScore !== null ? (
            <output
              className="pointer-events-none absolute inset-x-0 bottom-6 z-[5] flex justify-center px-3"
              aria-live="polite"
              aria-label={`採点 ${judgedScore} 点`}
            >
              <span className="border-2 border-[var(--border-color)] bg-[var(--background-color)]/90 px-4 py-2 font-mono text-2xl tabular-nums text-[var(--text-color)] md:text-3xl">
                {judgedScore}/100
              </span>
            </output>
          ) : null}
          {hintOpen ? (
            <HintOverlay target={targetGraph} user={userGraph} />
          ) : null}
        </div>
      </section>
    </main>
  );
}
