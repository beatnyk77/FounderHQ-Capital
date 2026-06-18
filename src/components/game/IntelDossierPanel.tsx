"use client";

import { fmtMoney } from "@/lib/format";
import { canInvestigate, INVESTIGATE_COST } from "@/lib/game/intel";
import type { GameRun, NewsArticle } from "@/lib/game/types";

const outcomeLabel = {
  confirmed: { text: "Confirmed", className: "text-positive" },
  conflicting: { text: "Conflicting reports", className: "text-caution" },
  false_flag: { text: "Likely false flag", className: "text-negative" },
};

interface Props {
  article: NewsArticle;
  run: GameRun;
  onInvestigate: () => void;
  onClose: () => void;
}

export function IntelDossierPanel({ article, run, onInvestigate, onClose }: Props) {
  const cost = article.verificationCost ?? INVESTIGATE_COST;
  const investigable = canInvestigate(run, article);
  const outcome = article.verifiedOutcome ? outcomeLabel[article.verifiedOutcome] : null;

  return (
    <div className="rounded-lg border border-violet-500/40 bg-violet-950/20 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-violet-300">
            {article.intelType === "regulatory" ? "Lobbyist Brief" : "Intel Dossier"}
          </p>
          <p className="mt-1 font-mono text-[10px] text-accent">{article.outlet} · Wk {article.week}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded border border-panel-border px-2 py-0.5 text-[10px] text-text-dim hover:bg-panel"
        >
          Close
        </button>
      </div>

      <h3 className="mt-2 font-semibold text-foreground">{article.headline}</h3>
      <p className="mt-1 text-sm text-text-dim">{article.body}</p>

      {article.intelType && (
        <p className="mt-2 font-mono text-[10px] text-text-dim">
          Type: {article.intelType}
          {article.relatedTargetId && " · ties to active deal flow"}
        </p>
      )}

      {outcome && (
        <p className={`mt-3 font-mono text-xs font-medium ${outcome.className}`}>
          Verification: {outcome.text}
          {article.verifiedOutcome === "confirmed" && article.intelModifier && (
            <span className="block text-text-dim">
              Unlocks +{(article.intelModifier.value * 100).toFixed(0)}% {article.intelModifier.label} odds
            </span>
          )}
        </p>
      )}

      {!article.verifiedOutcome && article.verifiable && (
        <button
          onClick={onInvestigate}
          disabled={!investigable}
          className="mt-3 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
        >
          {article.intelType === "regulatory" ? "Lobbyist brief" : "Investigate"} (−{fmtMoney(cost)})
        </button>
      )}
    </div>
  );
}