"use client";

import { fmtMoney } from "@/lib/format";

export function RunwayGauge({ cash, burn, revenue }: { cash: number; burn: number; revenue: number }) {
  const netBurn = burn - revenue;
  const weeks = netBurn > 0 ? Math.floor(cash / netBurn) : 99;
  const pct = Math.min(100, (weeks / 24) * 100);
  const color = weeks < 8 ? "bg-negative" : weeks < 16 ? "bg-caution" : "bg-positive";
  const textColor = weeks < 8 ? "text-negative" : weeks < 16 ? "text-caution" : "text-positive";

  return (
    <div className="rounded-lg border border-panel-border bg-panel/80 p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-wider text-text-dim">Cash / Runway</p>
        <p className={`font-mono text-sm font-semibold ${textColor} ${weeks < 8 ? "pulse-danger" : ""}`}>
          {weeks}w
        </p>
      </div>
      <p className="mt-1 font-mono text-lg font-bold text-foreground">{fmtMoney(cash)}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-text-dim">
        Net burn {fmtMoney(Math.max(0, netBurn))}/wk
      </p>
    </div>
  );
}