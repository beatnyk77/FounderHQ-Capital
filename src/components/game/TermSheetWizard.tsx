"use client";

import { useState } from "react";
import { fmtMoney } from "@/lib/format";
import { counterAcceptProbability, getEffectivePreMoney, getFundingStep } from "@/lib/game/fundingTheater";
import { computeOdds } from "@/lib/game/resolution";
import { buildTermSheetPreviews } from "@/lib/game/previewEngine";
import type { GameEvent, GameRun } from "@/lib/game/types";
import { ConsequencePreview } from "./ConsequencePreview";

interface Props {
  event: GameEvent;
  run: GameRun;
  onAccept: () => void;
  onWalk: () => void;
  onStartCounter: () => void;
  onSubmitCounter: (preMoney: number) => void;
}

export function TermSheetWizard({
  event,
  run,
  onAccept,
  onWalk,
  onStartCounter,
  onSubmitCounter,
}: Props) {
  const step = getFundingStep(event);
  const amount = event.payload?.amount ?? 0;
  const preMoney = getEffectivePreMoney(event) || event.payload?.preMoney || run.valuation;
  const originalPreMoney = event.payload?.originalPreMoney ?? preMoney;
  const [counterVal, setCounterVal] = useState(preMoney);

  const dilution = ((amount / (preMoney + amount)) * 100).toFixed(0);
  const odds = computeOdds("term_sheet", run, event);
  const previews = buildTermSheetPreviews(run, event);
  const counterProb = counterAcceptProbability(run, event, counterVal);

  const minCounter = originalPreMoney * 0.85;
  const maxCounter = originalPreMoney * 1.15;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex gap-1">
        {(["review", "counter", "resolve"] as const).map((s, i) => {
          const active = step === s;
          const done =
            (s === "review" && (step === "counter" || step === "resolve")) ||
            (s === "counter" && step === "resolve");
          return (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                active ? "bg-accent" : done ? "bg-positive/60" : "bg-panel-border"
              }`}
              title={s}
            />
          );
        })}
      </div>

      {step === "review" && (
        <>
          <p className="font-mono text-xs text-text-dim">
            ${(amount / 1e6).toFixed(1)}M at ${(preMoney / 1e6).toFixed(1)}M pre · Dilution ~{dilution}%
            {event.payload?.boardSeat && " · Board seat"}
          </p>
          <ConsequencePreview previews={previews} />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onAccept}
              className="rounded-lg bg-positive px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
            >
              Accept
            </button>
            <button
              onClick={onStartCounter}
              className="rounded-lg border border-accent/50 px-3 py-1.5 text-sm text-accent hover:bg-accent/10"
            >
              Counter
            </button>
            <button
              onClick={onWalk}
              className="rounded-lg border border-panel-border px-3 py-1.5 text-sm text-text-dim hover:bg-panel"
            >
              Walk
            </button>
          </div>
        </>
      )}

      {step === "counter" && (
        <>
          <p className="text-xs text-text-dim">Adjust pre-money valuation. Higher asks risk rejection.</p>
          <div className="space-y-2">
            <input
              type="range"
              min={minCounter}
              max={maxCounter}
              step={50_000}
              value={counterVal}
              onChange={(e) => setCounterVal(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <p className="font-mono text-sm text-foreground">
              Counter: {fmtMoney(counterVal)} pre
              <span className="ml-2 text-[10px] text-caution">
                ~{(counterProb * 100).toFixed(0)}% VC accepts
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSubmitCounter(counterVal)}
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
            >
              Submit Counter
            </button>
            <button
              onClick={onWalk}
              className="rounded-lg border border-panel-border px-3 py-1.5 text-sm text-text-dim hover:bg-panel"
            >
              Walk
            </button>
          </div>
        </>
      )}

      {step === "resolve" && (
        <>
          {event.payload?.vcResponse === "accepted_counter" && (
            <p className="text-xs text-positive">VC accepted your counter — improved terms locked in.</p>
          )}
          {event.payload?.vcResponse === "rejected_counter" && (
            <p className="text-xs text-negative">VC rejected your counter — original terms only.</p>
          )}
          <p className="font-mono text-xs text-text-dim">
            Final: ${(amount / 1e6).toFixed(1)}M at ${(preMoney / 1e6).toFixed(1)}M pre · {(odds.final * 100).toFixed(0)}% close
          </p>
          <div className="flex gap-2">
            <button
              onClick={onAccept}
              className="rounded-lg bg-positive px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
            >
              Accept Terms
            </button>
            <button
              onClick={onWalk}
              className="rounded-lg border border-panel-border px-3 py-1.5 text-sm text-text-dim hover:bg-panel"
            >
              Walk
            </button>
          </div>
        </>
      )}
    </div>
  );
}