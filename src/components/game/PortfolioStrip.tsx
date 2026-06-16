"use client";

import type { GameRun } from "@/lib/game/types";

interface Props {
  run: GameRun;
}

export function PortfolioStrip({ run }: Props) {
  if (!run.portfolio.length) return null;

  return (
    <section>
      <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">
        Portfolio ({run.portfolio.length})
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {run.portfolio.map((p) => (
          <div
            key={`${p.targetId}-${p.week}`}
            className="shrink-0 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2"
          >
            <p className="text-xs font-medium text-foreground">{p.name}</p>
            <p className="font-mono text-[10px] text-text-dim">
              Wk {p.week} · {p.integration} · syn +{p.synergyRealized.toFixed(0)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}