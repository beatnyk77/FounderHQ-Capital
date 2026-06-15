"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/game/store";
import { fmtMoney } from "@/lib/format";
import { CashStat, RunwayStat, StatBar } from "./StatBar";
import { EventCard } from "./EventCard";
import { NewsTicker } from "./NewsTicker";

export function RunHUD() {
  const run = useGameStore((s) => s.run);
  const startTicker = useGameStore((s) => s.startTicker);
  const resume = useGameStore((s) => s.resume);
  const operate = useGameStore((s) => s.operate);
  const acceptTermSheet = useGameStore((s) => s.acceptTermSheet);
  const declineEvent = useGameStore((s) => s.declineEvent);
  const buyTarget = useGameStore((s) => s.buyTarget);
  const exitRun = useGameStore((s) => s.exitRun);
  const abandonRun = useGameStore((s) => s.abandonRun);

  useEffect(() => {
    if (run?.status === "active") startTicker();
    return () => useGameStore.getState().stopTicker();
  }, [run?.id, run?.status, startTicker]);

  if (!run) return null;

  const pending = run.events.filter((e) => !e.resolved && e.week <= run.week);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">{run.companyName}</h1>
          <p className="text-sm text-zinc-500">
            Week {run.week} · {run.industry} · {run.stage.replace("_", " ")} ·{" "}
            {run.status === "paused" ? "⏸ Paused" : "▶ Live"}
          </p>
        </div>
        <div className="flex gap-2">
          {run.status === "paused" && (
            <button onClick={resume} className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900">
              Resume Clock
            </button>
          )}
          <button onClick={exitRun} className="rounded-lg border border-amber-600/50 px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-950">
            Exit
          </button>
          <button onClick={abandonRun} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800">
            Quit
          </button>
        </div>
      </header>

      {run.status === "bankrupt" && (
        <div className="rounded-xl border border-rose-500/50 bg-rose-950/40 p-6 text-center">
          <h2 className="text-xl font-bold text-rose-300">Bankrupt</h2>
          <p className="mt-2 text-zinc-400">Run ended at week {run.week}. Peak valuation {fmtMoney(run.peakValuation)}.</p>
          <button onClick={abandonRun} className="mt-4 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900">
            Return Home
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <CashStat cash={run.cash} />
        <RunwayStat cash={run.cash} burn={run.burn} revenue={run.revenue} />
        <StatBar label="Valuation" value={fmtMoney(run.valuation)} tone="good" />
        <StatBar label="Revenue/wk" value={fmtMoney(run.revenue)} />
        <StatBar label="Reputation" value={`${run.reputation}`} />
        <StatBar label="Ownership" value={`${run.founderOwnership.toFixed(0)}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Operate</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["hire", "rd", "sales", "cut"] as const).map((a) => (
              <button
                key={a}
                onClick={() => operate(a)}
                disabled={run.status === "bankrupt"}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm capitalize text-zinc-200 hover:border-zinc-500 disabled:opacity-40"
              >
                {a === "rd" ? "R&D" : a}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            Morale {run.morale.toFixed(0)} · Product {run.productScore.toFixed(0)} · Share {run.marketShare.toFixed(1)}%
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Market Wire</h2>
          <NewsTicker articles={run.news} />
        </section>
      </div>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Decision Queue</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {pending.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                onAccept={e.bucket === "opportunity" ? () => acceptTermSheet(e.id) : undefined}
                onDecline={() => declineEvent(e.id)}
                onAcquire={
                  e.bucket === "uncertainty" && e.payload?.targetId
                    ? () => buyTarget(e.payload!.targetId!)
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      )}

      {run.targets.length > 0 && run.stage !== "pre_seed" && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">M&A Targets</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {run.targets.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-200">{t.name}</p>
                  <p className="text-xs text-zinc-500">{fmtMoney(t.valuation)} · synergy +{t.synergy.toFixed(0)}</p>
                </div>
                <button
                  onClick={() => buyTarget(t.id)}
                  disabled={run.cash < t.valuation * 0.3}
                  className="rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 disabled:opacity-40"
                >
                  Acquire
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}