"use client";

import { useGameStore } from "@/lib/game/store";

export function Leaderboard() {
  const entries = useGameStore((s) => s.leaderboard);

  if (!entries.length) {
    return <p className="text-sm text-zinc-600">No completed runs yet. Exit a company to rank.</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map((e, i) => (
        <div key={`${e.date}-${i}`} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2">
          <div>
            <p className="font-medium text-zinc-200">
              #{i + 1} {e.companyName}
            </p>
            <p className="text-xs text-zinc-500">
              Week {e.week} · {e.exitType ?? "ended"}
            </p>
          </div>
          <p className="font-mono text-emerald-400">{e.score} pts</p>
        </div>
      ))}
    </div>
  );
}