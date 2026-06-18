"use client";

import { useGameStore } from "@/lib/game/store";

export function Leaderboard() {
  const entries = useGameStore((s) => s.leaderboard);

  if (!entries.length) {
    return <p className="text-sm text-text-dim">No completed runs yet. Claim victory or fold to rank.</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map((e, i) => (
        <div
          key={`${e.date}-${i}`}
          className={`flex items-center justify-between rounded-lg border px-4 py-2 ${
            e.exitType === "victory"
              ? "border-accent/40 bg-accent/5"
              : "border-panel-border bg-panel/40"
          }`}
        >
          <div>
            <p className="font-medium text-foreground">
              #{i + 1} {e.companyName}
            </p>
            <p className="text-xs text-text-dim">
              Week {e.week} ·{" "}
              {e.exitType === "victory"
                ? "Victory"
                : e.exitType === "fold"
                  ? "Fold"
                  : (e.exitType ?? "ended")}
              {e.victoryTracks?.length ? ` · ${e.victoryTracks.length} paths` : ""}
            </p>
          </div>
          <p className="font-mono text-accent">{e.score} pts</p>
        </div>
      ))}
    </div>
  );
}