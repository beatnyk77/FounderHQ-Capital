"use client";

import { getReputationTier } from "@/lib/design/tokens";
import type { GameRun } from "@/lib/game/types";

interface Props {
  run: GameRun;
}

export function ReputationLedger({ run }: Props) {
  const tier = getReputationTier(run.reputation);
  const swings = run.reputationSwings.slice(0, 5);

  return (
    <div className="rounded-lg border border-panel-border bg-background/50 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">Influence Ops</p>
        <p className="font-mono text-xs text-accent">
          {run.reputation} ★ {tier}
        </p>
      </div>

      <p className="mt-2 text-xs italic text-foreground/90">
        &ldquo;{run.publicNarrative || `${tier} founder — market still forming a view`}&rdquo;
      </p>

      {swings.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {swings.map((swing, i) => (
            <li key={`${swing.week}-${swing.source}-${i}`} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[10px] text-text-dim">
                  Wk {swing.week} · {swing.source}
                </p>
                <p className="truncate text-xs text-foreground">{swing.narrative}</p>
              </div>
              <span
                className={`shrink-0 font-mono text-xs ${swing.delta >= 0 ? "text-positive" : "text-negative"}`}
              >
                {swing.delta >= 0 ? "+" : ""}
                {swing.delta}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[10px] text-text-dim">No trust swings yet — influencer and operator moves will shift the narrative.</p>
      )}
    </div>
  );
}