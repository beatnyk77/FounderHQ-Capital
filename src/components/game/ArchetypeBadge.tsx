"use client";

import { getArchetypeSignals, getArchetypeTitle } from "@/lib/game/archetype";
import type { GameRun } from "@/lib/game/types";

export function ArchetypeBadge({ run }: { run: GameRun }) {
  const signals = getArchetypeSignals(run.archetype);

  return (
    <div className="rounded-lg border border-panel-border bg-panel/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">Founder Identity</p>
      {run.archetypeRevealed ? (
        <>
          <p className="mt-1 text-sm font-semibold text-accent">{getArchetypeTitle(run.archetype)}</p>
          <p className="mt-0.5 text-[10px] text-text-dim">Archetype locked at week 8 — affects score multiplier</p>
        </>
      ) : (
        <>
          <p className="mt-1 text-xs text-foreground">Signals forming…</p>
          {signals.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {signals.map((s) => (
                <li key={s} className="text-[10px] italic text-text-dim">
                  · {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[10px] text-text-dim">Decisions will shape your market identity.</p>
          )}
          <p className="mt-1 font-mono text-[9px] text-caution">Reveal at week 8</p>
        </>
      )}
    </div>
  );
}