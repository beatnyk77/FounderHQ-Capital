"use client";

import { computeOdds } from "@/lib/game/resolution";
import {
  buildDeclineUncertaintyPreview,
  buildRewardPreview,
  buildTermSheetPreviews,
  buildThreatPreview,
} from "@/lib/game/previewEngine";
import type { GameEvent, GameRun } from "@/lib/game/types";
import { ConsequencePreview } from "./ConsequencePreview";
import { TermSheetWizard } from "./TermSheetWizard";

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
  onStartCounter?: () => void;
  onSubmitCounter?: (preMoney: number) => void;
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

export function EventCard({
  event,
  run,
  onAccept,
  onDecline,
  onAcquire,
  onStartCounter,
  onSubmitCounter,
}: Props) {
  if (event.resolved) return null;

  const weeksLeft = event.expiresAtWeek - run.week;
  const previews = previewsForEvent(run, event);

  return (
    <div className={`rounded-xl border p-4 ${bucketStyles[event.bucket]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[10px] uppercase tracking-widest text-text-dim">{event.bucket}</p>
          {event.parentEventId && (
            <span className="rounded bg-violet-500/20 px-1.5 py-0.5 font-mono text-[9px] text-violet-300">
              CHAIN
            </span>
          )}
        </div>
        {weeksLeft > 0 && (
          <span className={`font-mono text-[10px] ${weeksLeft <= 1 ? "text-negative pulse-danger" : "text-caution"}`}>
            ⏱ {weeksLeft}wk left
          </span>
        )}
      </div>
      <h3 className="mt-1 font-semibold text-foreground">{event.title}</h3>
      <p className="mt-1 text-sm text-text-dim">{event.description}</p>

      {event.bucket !== "opportunity" && <OddsChips run={run} event={event} />}

      {event.bucket !== "opportunity" && <ConsequencePreview previews={previews} />}

      {event.resolution && (
        <p className={`mt-2 font-mono text-xs ${event.resolution.success ? "text-positive" : "text-negative"}`}>
          Rolled {(event.resolution.roll * 100).toFixed(0)}% vs {(event.resolution.threshold * 100).toFixed(0)}% needed
        </p>
      )}

      {event.bucket === "opportunity" && onAccept && onDecline && onStartCounter && onSubmitCounter && (
        <TermSheetWizard
          event={event}
          run={run}
          onAccept={onAccept}
          onWalk={onDecline}
          onStartCounter={onStartCounter}
          onSubmitCounter={onSubmitCounter}
        />
      )}

      <div className="mt-3 flex gap-2">
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