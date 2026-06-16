"use client";

import { buildDecisionAlert } from "@/lib/game/decisions";
import type { GameRun } from "@/lib/game/types";

interface Props {
  run: GameRun;
  onScrollToDecisions: () => void;
}

export function DecisionAlertBanner({ run, onScrollToDecisions }: Props) {
  const alert = buildDecisionAlert(run);
  if (!alert) return null;

  return (
    <div
      className={`border-b px-4 py-2 ${
        alert.urgentCount > 0
          ? "border-negative/50 bg-negative/10"
          : "border-caution/50 bg-caution/10"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <p className={`text-sm font-medium ${alert.urgentCount > 0 ? "text-negative" : "text-caution"}`}>
          {alert.urgentCount > 0 ? "⚠ " : "⏸ "}
          {alert.message}
        </p>
        <button
          onClick={onScrollToDecisions}
          className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
        >
          Review decisions
        </button>
      </div>
    </div>
  );
}