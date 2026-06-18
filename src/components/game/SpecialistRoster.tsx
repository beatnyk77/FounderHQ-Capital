"use client";

import { SPECIALISTS } from "@/lib/game/specialists";

export function SpecialistRoster() {
  return (
    <section className="rounded-lg border border-panel-border bg-panel/40 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">Specialist Roster</p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {SPECIALISTS.map((s) => (
          <div key={s.id} className="rounded border border-panel-border bg-background/40 px-2 py-1.5">
            <p className="text-[10px] font-medium text-foreground">{s.label}</p>
            <p className="mt-0.5 text-[9px] leading-tight text-text-dim">{s.channel}</p>
          </div>
        ))}
      </div>
    </section>
  );
}