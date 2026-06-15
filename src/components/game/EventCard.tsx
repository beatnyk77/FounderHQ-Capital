"use client";

import type { GameEvent } from "@/lib/game/types";

const bucketStyles: Record<GameEvent["bucket"], string> = {
  opportunity: "border-emerald-500/40 bg-emerald-950/30",
  threat: "border-rose-500/40 bg-rose-950/30",
  reward: "border-amber-500/40 bg-amber-950/30",
  uncertainty: "border-violet-500/40 bg-violet-950/30",
};

interface Props {
  event: GameEvent;
  onAccept?: () => void;
  onDecline?: () => void;
  onAcquire?: () => void;
}

export function EventCard({ event, onAccept, onDecline, onAcquire }: Props) {
  if (event.resolved) return null;

  return (
    <div className={`rounded-xl border p-4 ${bucketStyles[event.bucket]}`}>
      <p className="text-[10px] uppercase tracking-widest text-zinc-400">{event.bucket}</p>
      <h3 className="mt-1 font-semibold text-zinc-100">{event.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{event.description}</p>
      <div className="mt-3 flex gap-2">
        {event.bucket === "opportunity" && onAccept && (
          <>
            <button onClick={onAccept} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">
              Accept
            </button>
            <button onClick={onDecline} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
              Decline
            </button>
          </>
        )}
        {event.bucket === "uncertainty" && event.payload?.targetId && onAcquire && (
          <>
            <button onClick={onAcquire} className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500">
              Pursue M&A
            </button>
            <button onClick={onDecline} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
              Ignore
            </button>
          </>
        )}
        {event.bucket === "threat" && onDecline && (
          <button onClick={onDecline} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
            Acknowledge
          </button>
        )}
        {event.bucket === "reward" && onDecline && (
          <button onClick={onDecline} className="rounded-lg bg-amber-600/80 px-3 py-1.5 text-sm text-white hover:bg-amber-500">
            Collect
          </button>
        )}
      </div>
    </div>
  );
}