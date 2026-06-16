"use client";

import { useState } from "react";
import { INDUSTRIES, REGIMES } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/store";
import type { Industry, MacroRegime } from "@/lib/game/types";

export function NewRunWizard({ onStarted }: { onStarted: () => void }) {
  const startRun = useGameStore((s) => s.startRun);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<Industry>("saas");
  const [regime, setRegime] = useState<MacroRegime>("neutral");

  const handleStart = () => {
    if (!name.trim()) return;
    startRun(name.trim(), industry, regime);
    onStarted();
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-panel-border bg-panel/50 p-6">
      <div>
        <label className="text-xs uppercase tracking-wider text-text-dim">Company Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Labs"
          className="mt-1 w-full rounded-lg border border-panel-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-text-dim">Industry</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {INDUSTRIES.map((i) => (
            <button
              key={i.id}
              onClick={() => setIndustry(i.id)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                industry === i.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-panel-border text-text-dim hover:border-accent/50"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-text-dim">Macro Regime</label>
        <div className="mt-2 space-y-2">
          {REGIMES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRegime(r.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left ${
                regime === r.id ? "border-accent bg-accent/10" : "border-panel-border hover:border-accent/50"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{r.label}</p>
              <p className="text-xs text-text-dim">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!name.trim()}
        className="w-full rounded-xl bg-accent py-3 font-semibold text-background hover:opacity-90 disabled:opacity-40"
      >
        Launch Company
      </button>
    </div>
  );
}