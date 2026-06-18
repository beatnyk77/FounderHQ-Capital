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
  onDealRoom?: () => void;
  onScout: () => void;
  onOutbid?: () => void;
  onWalk?: () => void;
  onAccelerate?: () => void;
}

function heatColor(heat: number): string {
  if (heat >= 75) return "bg-negative";
  if (heat >= 45) return "bg-caution";
  return "bg-accent";
}

function heatLabel(heat: number): string {
  if (heat >= 80) return "FINAL ROUND";
  if (heat >= 55) return "Hot";
  if (heat >= 25) return "Warming";
  return "Cold";
}

export function DealCard({
  target,
  run,
  onAcquire,
  onDealRoom,
  onScout,
  onOutbid,
  onWalk,
  onAccelerate,
}: Props) {
  const scouted = run.scoutedTargets.includes(target.id);
  const odds = computeOdds("ma_close", run, undefined, target);
  const outbidOdds = computeOdds("ma_close", run, undefined, target, { outbid: true });
  const canAfford = run.cash >= target.valuation * 0.3;
  const canScout = !scouted && run.cash >= 25_000;
  const previews = buildMaPreviews(run, target);
  const rival = run.npcs.find((n) => n.role === "rival");
  const heat = target.heatLevel ?? 0;
  const showHeat = scouted || heat > 0;

  return (
    <div
      className={`rounded-lg border bg-panel/60 px-4 py-3 ${
        target.rivalBid ? "border-negative/40" : "border-panel-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{target.name}</p>
            {showHeat && (
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
                  heat >= 75 ? "bg-negative/20 text-negative pulse-danger" : "bg-caution/20 text-caution"
                }`}
              >
                {heatLabel(heat)}
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-text-dim">
            {fmtMoney(target.valuation)} · synergy +{target.synergy.toFixed(0)}
          </p>

          {showHeat && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-text-dim">
                <span>Deal heat</span>
                <span className="font-mono">{heat}/100</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-background">
                <div
                  className={`h-full transition-all ${heatColor(heat)}`}
                  style={{ width: `${heat}%` }}
                />
              </div>
            </div>
          )}

          {target.rivalBid && rival && (
            <p className="mt-2 font-mono text-[10px] text-negative">
              {rival.name} bid {fmtMoney(target.rivalBid)}
            </p>
          )}

          {scouted ? (
            <p className={`mt-1 font-mono text-[10px] ${target.healthScore < 50 ? "text-negative" : "text-positive"}`}>
              Health {target.healthScore.toFixed(0)}/100
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-text-dim">Health unknown — due diligence for $25K</p>
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
              Due diligence
            </button>
          )}
          {scouted && onAccelerate && heat < 80 && (
            <button
              onClick={onAccelerate}
              className="rounded-lg border border-caution/50 px-2 py-1 text-[10px] text-caution hover:bg-caution/10"
            >
              Accelerate
            </button>
          )}
          {target.rivalBid && onOutbid ? (
            <>
              <button
                onClick={onOutbid}
                disabled={!canAfford}
                className="rounded-lg bg-negative px-2 py-1 text-[10px] font-medium text-white hover:opacity-90 disabled:opacity-40"
                title={`${(outbidOdds.final * 100).toFixed(0)}% odds`}
              >
                Outbid
              </button>
              {onWalk && (
                <button
                  onClick={onWalk}
                  className="rounded-lg border border-panel-border px-2 py-1 text-[10px] text-text-dim hover:bg-panel"
                >
                  Let go
                </button>
              )}
            </>
          ) : scouted && onDealRoom ? (
            <button
              onClick={onDealRoom}
              disabled={!canAfford}
              className="rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 disabled:opacity-40"
            >
              Legal close
            </button>
          ) : (
            <button
              onClick={onAcquire}
              disabled={!canAfford}
              className="rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 disabled:opacity-40"
            >
              Acquire rival
            </button>
          )}
        </div>
      </div>
    </div>
  );
}