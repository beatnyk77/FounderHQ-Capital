"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/game/store";
import { Leaderboard } from "@/components/game/Leaderboard";
import { NewRunWizard } from "@/components/game/NewRunWizard";
import { RunHUD } from "@/components/game/RunHUD";

export default function Home() {
  const run = useGameStore((s) => s.run);
  const [showWizard, setShowWizard] = useState(false);

  if (run) return <RunHUD />;

  return (
    <main className="min-h-screen bg-[#0B1120] text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
        <header className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Phase 1 MVP</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">FounderHQ Capital</h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Build your startup. Raise capital. Acquire rivals. Survive the cycle. One game week every 2.5 minutes.
          </p>
        </header>

        {showWizard ? (
          <NewRunWizard onStarted={() => setShowWizard(false)} />
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setShowWizard(true)}
              className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500"
            >
              Start New Run
            </button>
          </div>
        )}

        <section className="mt-16">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Leaderboard</h2>
          <Leaderboard />
        </section>
      </div>
    </main>
  );
}