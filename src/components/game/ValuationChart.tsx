"use client";

import { fmtMoney } from "@/lib/format";

export function ValuationChart({ history, current }: { history: number[]; current: number }) {
  const data = history.length > 0 ? history : [current];
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;
  const w = 200;
  const h = 48;
  const padding = 4;

  const points = data
    .map((v, i) => {
      const x = padding + (i / Math.max(data.length - 1, 1)) * (w - padding * 2);
      const y = h - padding - ((v - min) / range) * (h - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const prev = data.length > 1 ? data[data.length - 2] : current;
  const delta = prev > 0 ? ((current - prev) / prev) * 100 : 0;
  const up = delta >= 0;

  return (
    <div className="rounded-lg border border-panel-border bg-panel/80 p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-wider text-text-dim">Valuation</p>
        <p className={`font-mono text-xs ${up ? "text-positive" : "text-negative"}`}>
          {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
        </p>
      </div>
      <p className="font-mono text-lg font-bold text-foreground">{fmtMoney(current)}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 w-full" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          points={points}
        />
        {data.length > 0 && (
          <circle
            cx={padding + ((data.length - 1) / Math.max(data.length - 1, 1)) * (w - padding * 2)}
            cy={h - padding - ((current - min) / range) * (h - padding * 2)}
            r="3"
            fill="var(--accent)"
          />
        )}
      </svg>
    </div>
  );
}