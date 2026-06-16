"use client";

import { computeOdds } from "@/lib/game/resolution";
import { fmtMoney } from "@/lib/format";
import {
  buildDeclineUncertaintyPreview,
  buildRewardPreview,
  buildTermSheetPreviews,
  buildThreatPreview,
} from "@/lib/game/previewEngine";
import type { GameEvent, GameRun } from "@/lib/game/types";
import { ConsequencePreview } from "./ConsequencePreview";

const bucketStyles: Record<GameEvent["bucket"], string> = {
  opportunity: "border-positive/40 bg-positive/5",
  threat: "border-negative/40 bg-negative/5",
  reward: "border-caution/40 bg-caution/5",
  uncertainty: "border-violet-500/40 bg-violet-950/30",
};

interface Props {
  event: GameEvent;
  run: GameRun;
  onAccept?: () => void;
  onDecline?: () => void;
  onAcquire?: () => void;
}

function OddsChips({ run, event }: { run: GameRun; event: GameEvent }) {
  const action =
    event.bucket === "opportunity"
      ? "term_sheet"
      : event.bucket === "reward"
        ? "customer_win"
        : event.bucket === "threat"
          ? "threat_mitigate"
          : null;

  if (!action) return null;

  const odds = computeOdds(action, run, event);
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      <span className="rounded bg-background px-2 py-0.5 font-mono text-[10px] text-accent">
        {(odds.final * 100).toFixed(0)}% odds
      </span>
      {odds.modifiers.map((m) => (
        <span
          key={m.label}
          className={`rounded px-2 py-0.5 font-mono text-[10px] ${m.value >= 0 ? "text-positive" : "text-negative"}`}
        >
          {m.value >= 0 ? "+" : ""}
          {(m.value * 100).toFixed(0)}% {m.label}
        </span>
      ))}
    </div>
  );
}

function previewsForEvent(run: GameRun, event: GameEvent) {
  switch (event.bucket) {
    case "opportunity":
      return buildTermSheetPreviews(run, event);
    case "threat":
      return buildThreatPreview(run, event);
    case "reward":
      return buildRewardPreview(run, event);
    case "uncertainty":
      return buildDeclineUncertaintyPreview(run, event);
    default:
      return [];
  }
}

export function EventCard({ event, run, onAccept, onDecline, onAcquire }: Props) {
  if (event.resolved) return null;

  const weeksLeft = event.expiresAtWeek - run.week;
  const previews = previewsForEvent(run, event);

  return (
    <div className={`rounded-xl border p-4 ${bucketStyles[event.bucket]}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] uppercase tracking-widest text-text-dim">{event.bucket}</p>
        {weeksLeft > 0 && (
          <span className={`font-mono text-[10px] ${weeksLeft <= 1 ? "text-negative pulse-danger" : "text-caution"}`}>
            ⏱ {weeksLeft}wk left
          </span>
        )}
      </div>
      <h3 className="mt-1 font-semibold text-foreground">{event.title}</h3>
      <p className="mt-1 text-sm text-text-dim">{event.description}</p>

      {event.bucket === "opportunity" && event.payload?.amount && (
        <p className="mt-2 font-mono text-xs text-text-dim">
          Dilution ~{((event.payload.amount / ((event.payload.preMoney ?? 0) + event.payload.amount)) * 100).toFixed(0)}%
          · Cash +{fmtMoney(event.payload.amount)}
        </p>
      )}

      <OddsChips run={run} event={event} />

      <ConsequencePreview previews={previews} />

      {event.resolution && (
        <p className={`mt-2 font-mono text-xs ${event.resolution.success ? "text-positive" : "text-negative"}`}>
          Rolled {(event.resolution.roll * 100).toFixed(0)}% vs {(event.resolution.threshold * 100).toFixed(0)}% needed
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {event.bucket === "opportunity" && onAccept && (
          <>
            <button onClick={onAccept} className="rounded-lg bg-positive px-3 py-1.5 text-sm font-medium text-background hover:opacity-90">
              Accept
            </button>
            <button onClick={onDecline} className="rounded-lg border border-panel-border px-3 py-1.5 text-sm text-text-dim hover:bg-panel">
              Walk
            </button>
          </>
        )}
        {event.bucket === "uncertainty" && event.payload?.targetId && onAcquire && (
          <>
            <button onClick={onAcquire} className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500">
              Pursue M&A
            </button>
            <button onClick={onDecline} className="rounded-lg border border-panel-border px-3 py-1.5 text-sm text-text-dim hover:bg-panel">
              Ignore
            </button>
          </>
        )}
        {event.bucket === "threat" && onDecline && (
          <button onClick={onDecline} className="rounded-lg border border-negative/50 px-3 py-1.5 text-sm text-negative hover:bg-negative/10">
            Mitigate
          </button>
        )}
        {event.bucket === "reward" && onDecline && (
          <button onClick={onDecline} className="rounded-lg bg-caution/80 px-3 py-1.5 text-sm font-medium text-background hover:opacity-90">
            Close Deal
          </button>
        )}
      </div>
    </div>
  );
}