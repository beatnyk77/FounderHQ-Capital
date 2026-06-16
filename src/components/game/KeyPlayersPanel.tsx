"use client";

import { stanceColor, stanceLabel } from "@/lib/game/npcMemory";
import type { GameRun } from "@/lib/game/types";

export function KeyPlayersPanel({ run }: { run: GameRun }) {
  return (
    <div className="rounded-lg border border-panel-border bg-panel/40 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">Key Players</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {run.npcs.map((n) => {
          const lastMemory = n.memory[0];
          return (
            <div key={n.id} className="rounded border border-panel-border bg-background/50 px-2 py-1.5">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[10px] uppercase text-text-dim">{n.role}</p>
                <span className={`font-mono text-[9px] ${stanceColor(n.stance)}`}>{stanceLabel(n.stance)}</span>
              </div>
              <p className="text-xs font-medium text-foreground">{n.name}</p>
              <p className="font-mono text-[10px] text-accent">Trust {n.trust}</p>
              {lastMemory && (
                <p className="mt-1 truncate text-[9px] text-text-dim" title={lastMemory.narrative}>
                  Wk{lastMemory.week}: {lastMemory.narrative}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}