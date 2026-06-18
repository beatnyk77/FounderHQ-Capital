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
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-panel-border bg-panel/30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <p className="font-mono text-xs text-accent">FOUNDERHQ CAPITAL</p>
          <span className="rounded border border-caution/40 px-2 py-0.5 font-mono text-[10px] text-caution">
            Season 1: Build Cycle
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
        <header className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Capital Markets Sim</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">FounderHQ Capital</h1>
          <p className="mx-auto mt-4 max-w-xl text-text-dim">
            Deploy specialists. Control cash, trust, influence, and talent. Acquire rivals, capture markets,
            and win by completing 2 victory paths. One game week every 2.5 minutes.
          </p>
        </header>

        <div className="mx-auto mb-8 max-w-lg rounded-xl border border-panel-border bg-panel/50 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">Today&apos;s Market</p>
          <div className="flex flex-wrap justify-center gap-4 font-mono text-xs">
            <span>
              S&P Proxy <span className="text-positive">+1.2%</span>
            </span>
            <span>
              Rates <span className="text-foreground">5.25%</span>
            </span>
            <span>
              Credit <span className="text-caution">Tightening ▼</span>
            </span>
          </div>
        </div>

        {showWizard ? (
          <NewRunWizard onStarted={() => setShowWizard(false)} />
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setShowWizard(true)}
              className="rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-background shadow-lg shadow-accent/20 hover:opacity-90"
            >
              ▶ Start New Run
            </button>
          </div>
        )}

        <section className="mt-16">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-dim">Leaderboard</h2>
          <Leaderboard />
        </section>
      </div>
    </main>
  );
}