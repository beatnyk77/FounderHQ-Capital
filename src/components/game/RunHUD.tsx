"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGameTabTitle } from "@/hooks/useGameTabTitle";
import { getReputationTier } from "@/lib/design/tokens";
import { fmtMoney } from "@/lib/format";
import { OPERATE_COSTS } from "@/lib/game/types";
import { useGameStore } from "@/lib/game/store";
import { DecisionAlertBanner } from "./DecisionAlertBanner";
import { DealCard } from "./DealCard";
import { EventCard } from "./EventCard";
import { MacroBar } from "./MacroBar";
import { NewsTicker } from "./NewsTicker";
import { ReputationLedger } from "./ReputationLedger";
import { RunwayGauge } from "./RunwayGauge";
import { StatBar } from "./StatBar";
import { TickerTape } from "./TickerTape";
import { ValuationChart } from "./ValuationChart";
import { WeekCountdown } from "./WeekCountdown";
import { WeekRecapModal } from "./WeekRecapModal";

export function RunHUD() {
  const run = useGameStore((s) => s.run);
  const startTicker = useGameStore((s) => s.startTicker);
  const resume = useGameStore((s) => s.resume);
  const clearWeekRecap = useGameStore((s) => s.clearWeekRecap);
  const operate = useGameStore((s) => s.operate);
  const acceptTermSheet = useGameStore((s) => s.acceptTermSheet);
  const declineEvent = useGameStore((s) => s.declineEvent);
  const buyTarget = useGameStore((s) => s.buyTarget);
  const scoutTargetAction = useGameStore((s) => s.scoutTarget);
  const investigateIntel = useGameStore((s) => s.investigateIntel);
  const exitRun = useGameStore((s) => s.exitRun);
  const abandonRun = useGameStore((s) => s.abandonRun);
  const decisionQueueRef = useRef<HTMLElement>(null);

  useGameTabTitle(run);

  const scrollToDecisions = useCallback(() => {
    decisionQueueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (run?.status === "active" && !run.weekRecap) {
      startTicker();
    } else if (run) {
      useGameStore.getState().stopTicker(true);
    }
    return () => useGameStore.getState().stopTicker();
  }, [run?.id, run?.status, run?.weekRecap, startTicker]);

  if (!run) return null;

  const pending = run.events.filter((e) => !e.resolved && e.week <= run.week);
  const repTier = getReputationTier(run.reputation);
  const stageLabel = run.stage.replace("_", " ").toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WeekRecapModal recap={run.weekRecap} onContinue={clearWeekRecap} />

      <div className="border-b border-panel-border bg-panel/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">{run.companyName}</h1>
              <span className="rounded bg-background px-2 py-0.5 font-mono text-[10px] text-accent">
                {stageLabel}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-xs text-text-dim">
              Week {run.week} · {run.industry} · {run.regime} market ·{" "}
              {run.status === "paused" ? "⏸ PAUSED" : run.status === "bankrupt" ? "✗ BANKRUPT" : "● LIVE"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WeekCountdown run={run} />
            {run.status === "paused" && (
              <button
                onClick={resume}
                className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
              >
                Resume Clock
              </button>
            )}
            <button
              onClick={exitRun}
              className="rounded-lg border border-caution/50 px-3 py-1.5 text-sm text-caution hover:bg-caution/10"
            >
              Exit
            </button>
            <button
              onClick={abandonRun}
              className="rounded-lg border border-panel-border px-3 py-1.5 text-sm text-text-dim hover:bg-panel"
            >
              Quit
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3">
          <TickerTape articles={run.news} />
        </div>
        <DecisionAlertBanner run={run} onScrollToDecisions={scrollToDecisions} />
      </div>

      <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
        {run.status === "bankrupt" && (
          <div className="rounded-xl border border-negative/50 bg-negative/10 p-6 text-center">
            <h2 className="text-xl font-bold text-negative">Bankrupt</h2>
            <p className="mt-2 text-text-dim">
              Run ended at week {run.week}. Peak valuation {fmtMoney(run.peakValuation)}.
            </p>
            <button
              onClick={abandonRun}
              className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Return Home
            </button>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Command Panel */}
          <div className="space-y-4 lg:col-span-2">
            <RunwayGauge cash={run.cash} burn={run.burn} revenue={run.revenue} />
            <ValuationChart history={run.valuationHistory} current={run.valuation} />

            <div className="grid grid-cols-2 gap-2">
              <StatBar label="Revenue/wk" value={fmtMoney(run.revenue)} tone="good" />
              <StatBar label="Ownership" value={`${run.founderOwnership.toFixed(0)}%`} />
              <StatBar label="Reputation" value={`${run.reputation} ★ ${repTier}`} />
              <StatBar label="Employees" value={`${run.employees}`} />
            </div>

            <div className="rounded-lg border border-panel-border bg-panel/60 p-3">
              <p className="mb-1 text-[10px] text-text-dim">
                Morale {run.morale.toFixed(0)} · Product {run.productScore.toFixed(0)} · Share {run.marketShare.toFixed(1)}%
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-background">
                <div className="h-full bg-accent" style={{ width: `${run.productScore}%` }} />
              </div>
            </div>

            <section>
              <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">Operate</h2>
              <div className="grid grid-cols-2 gap-2">
                {(["hire", "rd", "sales", "cut"] as const).map((a) => {
                  const cost = OPERATE_COSTS[a];
                  const disabled =
                    run.status === "bankrupt" ||
                    run.operateUsedThisWeek ||
                    (cost.cash > 0 && run.cash < cost.cash);
                  return (
                    <button
                      key={a}
                      onClick={() => operate(a)}
                      disabled={disabled}
                      title={cost.preview}
                      className="rounded-lg border border-panel-border bg-panel px-3 py-3 text-left text-sm hover:border-accent/50 disabled:opacity-40"
                    >
                      <span className="font-medium text-foreground">{cost.label}</span>
                      {cost.cash > 0 && (
                        <span className="mt-0.5 block font-mono text-[10px] text-negative">
                          −{fmtMoney(cost.cash)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {run.operateUsedThisWeek && (
                <p className="mt-1 text-[10px] text-text-dim">One operate action per week — used this week.</p>
              )}
            </section>

            {run.targets.length > 0 && run.stage !== "pre_seed" && (
              <section>
                <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">Deal Flow</h2>
                <div className="space-y-2">
                  {run.targets.map((t) => (
                    <DealCard
                      key={t.id}
                      target={t}
                      run={run}
                      onAcquire={() => buyTarget(t.id)}
                      onScout={() => scoutTargetAction(t.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Market Wire Panel */}
          <div className="space-y-4 lg:col-span-3">
            <MacroBar run={run} />

            <div className="rounded-lg border border-panel-border bg-panel/40 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">Key Players</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {run.npcs.map((n) => (
                  <div key={n.id} className="rounded border border-panel-border bg-background/50 px-2 py-1.5">
                    <p className="text-[10px] uppercase text-text-dim">{n.role}</p>
                    <p className="text-xs font-medium text-foreground">{n.name}</p>
                    <p className="font-mono text-[10px] text-accent">Trust {n.trust}</p>
                  </div>
                ))}
              </div>
            </div>

            <ReputationLedger run={run} />

            <section>
              <h2 className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                Market Wire
                <span className="rounded bg-positive/20 px-1.5 py-0.5 font-mono text-[9px] text-positive">LIVE</span>
              </h2>
              <NewsTicker
                articles={run.news}
                run={run}
                onInvestigate={(id) => investigateIntel(id)}
              />
            </section>

            {pending.length > 0 && (
              <section id="decision-queue" ref={decisionQueueRef}>
                <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                  Decision Queue ({pending.length} pending)
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {pending.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      run={run}
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
          </div>
        </div>
      </div>
    </div>
  );
}