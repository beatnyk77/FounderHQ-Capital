"use client";

import { useState } from "react";
import type { GameRun, NewsArticle } from "@/lib/game/types";
import { IntelDossierPanel } from "./IntelDossierPanel";

const sentimentBorder = {
  positive: "border-positive/20",
  negative: "border-negative/20",
  neutral: "border-panel-border",
};

interface Props {
  articles: NewsArticle[];
  run?: GameRun;
  onInvestigate?: (articleId: string) => void;
}

export function NewsTicker({ articles, run, onInvestigate }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = articles.find((a) => a.id === selectedId);

  if (!articles.length) {
    return (
      <div className="rounded-lg border border-panel-border bg-panel/40 p-4 text-sm text-text-dim">
        Market wire quiet — advance the clock.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selected && run && onInvestigate && (
        <IntelDossierPanel
          article={selected}
          run={run}
          onInvestigate={() => onInvestigate(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      )}

      <div className="max-h-56 space-y-2 overflow-y-auto">
        {articles.slice(0, 10).map((a) => {
          const isIntel = a.verifiable;
          const verified = a.verifiedOutcome;
          const clickable = isIntel && run && onInvestigate;

          return (
            <div
              key={a.id}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? () => setSelectedId(a.id) : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedId(a.id);
                    }
                  : undefined
              }
              className={`rounded-lg border bg-background/50 px-3 py-2 ${sentimentBorder[a.sentiment]} ${
                clickable ? "cursor-pointer hover:border-accent/40" : ""
              } ${selectedId === a.id ? "border-accent/50" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">{a.outlet}</span>
                <span className="text-[10px] text-text-dim">Wk {a.week}</span>
                {isIntel && !verified && (
                  <span className="rounded bg-caution/20 px-1.5 py-0.5 font-mono text-[10px] text-caution">
                    ? INTEL
                  </span>
                )}
                {verified === "confirmed" && (
                  <span className="rounded bg-positive/20 px-1.5 py-0.5 font-mono text-[10px] text-positive">
                    ✓ VERIFIED
                  </span>
                )}
                {verified === "conflicting" && (
                  <span className="rounded bg-caution/20 px-1.5 py-0.5 font-mono text-[10px] text-caution">
                    ⚡ SPLIT
                  </span>
                )}
                {verified === "false_flag" && (
                  <span className="rounded bg-negative/20 px-1.5 py-0.5 font-mono text-[10px] text-negative">
                    ✗ FALSE
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm font-medium text-foreground">{a.headline}</p>
              <p className="text-xs text-text-dim">{a.body}</p>
              {clickable && !verified && (
                <p className="mt-1 text-[10px] text-accent">Click to open dossier →</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}