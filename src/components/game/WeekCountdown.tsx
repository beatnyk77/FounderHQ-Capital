"use client";

import { useEffect, useState } from "react";
import { getCountdownLabel, getMsUntilTick } from "@/lib/game/ticker";
import type { GameRun } from "@/lib/game/types";

export function WeekCountdown({ run }: { run: GameRun }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const msLeft = getMsUntilTick(run.nextTickAt, now);
  const label = getCountdownLabel(msLeft, run.status, !!run.weekRecap);
  const isLive = run.status === "active" && !run.weekRecap;

  return (
    <div
      className={`rounded-lg border px-3 py-2 font-mono ${
        isLive ? "border-accent/40 bg-accent/5" : "border-panel-border bg-panel/60"
      }`}
    >
      <p className="text-[10px] uppercase tracking-widest text-text-dim">Next Week</p>
      <p className={`text-lg font-bold ${isLive ? "text-accent" : "text-text-dim"}`}>{label}</p>
      {isLive && msLeft != null && msLeft < 30_000 && (
        <p className="text-[10px] text-caution">Week advancing soon</p>
      )}
    </div>
  );
}