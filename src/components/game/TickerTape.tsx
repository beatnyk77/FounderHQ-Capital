"use client";

import type { NewsArticle } from "@/lib/game/types";

const sentimentColor = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-text-dim",
};

export function TickerTape({ articles }: { articles: NewsArticle[] }) {
  if (!articles.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-panel-border bg-panel/60 px-4 py-2">
        <p className="font-mono text-xs text-text-dim">MARKET WIRE QUIET — ADVANCE THE CLOCK</p>
      </div>
    );
  }

  const items = articles.slice(0, 6);
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden rounded-lg border border-panel-border bg-panel/60 py-2">
      <div className="ticker-scroll flex whitespace-nowrap">
        {doubled.map((a, i) => (
          <span key={`${a.id}-${i}`} className="mx-6 inline-flex items-center gap-2 font-mono text-xs">
            <span className="text-accent">▶</span>
            <span className="text-text-dim">[{a.outlet}]</span>
            <span className={sentimentColor[a.sentiment]}>{a.headline}</span>
          </span>
        ))}
      </div>
    </div>
  );
}