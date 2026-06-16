"use client";

import type { NewsArticle } from "@/lib/game/types";

const sentimentBorder = {
  positive: "border-positive/20",
  negative: "border-negative/20",
  neutral: "border-panel-border",
};

export function NewsTicker({ articles }: { articles: NewsArticle[] }) {
  if (!articles.length) {
    return (
      <div className="rounded-lg border border-panel-border bg-panel/40 p-4 text-sm text-text-dim">
        Market wire quiet — advance the clock.
      </div>
    );
  }

  return (
    <div className="max-h-56 space-y-2 overflow-y-auto">
      {articles.slice(0, 10).map((a) => (
        <div key={a.id} className={`rounded-lg border bg-background/50 px-3 py-2 ${sentimentBorder[a.sentiment]}`}>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-accent">{a.outlet}</span>
            <span className="text-[10px] text-text-dim">Wk {a.week}</span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-foreground">{a.headline}</p>
          <p className="text-xs text-text-dim">{a.body}</p>
        </div>
      ))}
    </div>
  );
}