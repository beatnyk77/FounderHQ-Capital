"use client";

import { fmtPct } from "@/lib/format";
import type { GameRun } from "@/lib/game/types";

export function MacroBar({ run }: { run: GameRun }) {
  const { macro, regime, sectorIndex, industry } = run;
  const sentimentPct = macro.marketSentiment * 100;
  const regimePos = regime === "bull" ? 80 : regime === "neutral" ? 50 : 20;

  return (
    <div className="rounded-lg border border-panel-border bg-panel/80 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">Macro</p>
      <div className="space-y-2">
        <div>
          <div className="mb-1 flex justify-between text-[10px] text-text-dim">
            <span>Bear</span>
            <span className="capitalize text-accent">{regime}</span>
            <span>Bull</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-background">
            <div
              className="absolute top-0 h-full w-2 -translate-x-1/2 rounded-full bg-accent"
              style={{ left: `${regimePos}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
          <span className="text-text-dim">
            Rate <span className="text-foreground">{(macro.interestRate * 100).toFixed(1)}%</span>
          </span>
          <span className="text-text-dim">
            GDP <span className="text-positive">+{(macro.gdpGrowth * 100).toFixed(1)}%</span>
          </span>
          <span className="text-text-dim">
            CPI <span className="text-caution">{(macro.inflation * 100).toFixed(0)}%</span>
          </span>
          <span className="text-text-dim">
            Spread <span className="text-foreground">{(macro.creditSpread * 100).toFixed(1)}%</span>
          </span>
          <span className="text-text-dim">
            Sentiment <span className={sentimentPct > 50 ? "text-positive" : "text-negative"}>{fmtPct(sentimentPct)}</span>
          </span>
          <span className="text-text-dim">
            {industry.toUpperCase()} <span className="text-positive">{fmtPct(sectorIndex - 100)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}