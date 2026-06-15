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
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div>
        <label className="text-xs uppercase tracking-wider text-zinc-500">Company Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Labs"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-zinc-500">Industry</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {INDUSTRIES.map((i) => (
            <button
              key={i.id}
              onClick={() => setIndustry(i.id)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                industry === i.id
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-zinc-500">Macro Regime</label>
        <div className="mt-2 space-y-2">
          {REGIMES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRegime(r.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left ${
                regime === r.id
                  ? "border-emerald-500 bg-emerald-950/40"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <p className="text-sm font-medium text-zinc-200">{r.label}</p>
              <p className="text-xs text-zinc-500">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!name.trim()}
        className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
      >
        Launch Company
      </button>
    </div>
  );
}