"use client";

import { VICTORY_SUBTITLE } from "@/lib/game/specialists";
import { getVictoryTracks, VICTORY_REQUIRED } from "@/lib/game/victoryTracks";
import type { GameRun } from "@/lib/game/types";

interface Props {
  run: GameRun;
}

export function VictoryTracksPanel({ run }: Props) {
  const tracks = getVictoryTracks(run);
  const completed = tracks.filter((t) => t.complete).length;

  return (
    <section className="rounded-lg border border-panel-border bg-panel/60 p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">Victory Paths</h2>
        <p className="font-mono text-[10px] text-accent">
          {completed}/{VICTORY_REQUIRED} · {VICTORY_SUBTITLE}
        </p>
      </div>
      <div className="space-y-2">
        {tracks.map((track) => (
          <div key={track.id}>
            <div className="flex items-center justify-between gap-2 text-[10px]">
              <span className={track.complete ? "text-accent" : "text-foreground"}>
                {track.complete ? "✓ " : ""}
                {track.label}
              </span>
              <span className="truncate text-text-dim">{track.detail}</span>
            </div>
            <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-background">
              <div
                className={`h-full transition-all ${track.complete ? "bg-accent" : "bg-accent/50"}`}
                style={{ width: `${track.progress * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}