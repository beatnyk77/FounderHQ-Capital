"use client";

import { computeOdds } from "@/lib/game/resolution";
import { fmtMoney } from "@/lib/format";
import { buildMaPreviews } from "@/lib/game/previewEngine";
import type { AcquisitionTarget, GameRun } from "@/lib/game/types";
import { ConsequencePreview } from "./ConsequencePreview";

interface Props {
  target: AcquisitionTarget;
  run: GameRun;
  onAcquire: () => void;
  onScout: () => void;
}

export function DealCard({ target, run, onAcquire, onScout }: Props) {
  const scouted = run.scoutedTargets.includes(target.id);
  const odds = computeOdds("ma_close", run, undefined, target);
  const canAfford = run.cash >= target.valuation * 0.3;
  const canScout = !scouted && run.cash >= 25_000;
  const previews = buildMaPreviews(run, target);

  return (
    <div className="rounded-lg border border-panel-border bg-panel/60 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{target.name}</p>
          <p className="font-mono text-xs text-text-dim">
            {fmtMoney(target.valuation)} · synergy +{target.synergy.toFixed(0)}
          </p>
          {scouted ? (
            <p className={`mt-1 font-mono text-[10px] ${target.healthScore < 50 ? "text-negative" : "text-positive"}`}>
              Health {target.healthScore.toFixed(0)}/100
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-text-dim">Health unknown — scout for $25K</p>
          )}
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-accent">
              {(odds.final * 100).toFixed(0)}% close
            </span>
            {odds.modifiers.map((m) => (
              <span key={m.label} className="font-mono text-[10px] text-text-dim">
                {m.value >= 0 ? "+" : ""}
                {(m.value * 100).toFixed(0)}% {m.label}
              </span>
            ))}
          </div>
          <ConsequencePreview previews={previews} />
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          {!scouted && (
            <button
              onClick={onScout}
              disabled={!canScout}
              className="rounded-lg border border-accent/50 px-2 py-1 text-[10px] font-medium text-accent hover:bg-accent/10 disabled:opacity-40"
            >
              Scout
            </button>
          )}
          <button
            onClick={onAcquire}
            disabled={!canAfford}
            className="rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 disabled:opacity-40"
          >
            Acquire
          </button>
        </div>
      </div>
    </div>
  );
}