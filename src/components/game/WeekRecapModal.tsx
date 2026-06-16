"use client";

import { motion, AnimatePresence } from "framer-motion";
import { fmtMoney } from "@/lib/format";
import type { WeekRecap } from "@/lib/game/types";

interface Props {
  recap: WeekRecap | null;
  onContinue: () => void;
}

export function WeekRecapModal({ recap, onContinue }: Props) {
  if (!recap) return null;

  const revPct = recap.prevRevenue > 0 ? (recap.revenueDelta / recap.prevRevenue) * 100 : 0;
  const valPct = recap.prevValuation > 0 ? (recap.valuationDelta / recap.prevValuation) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-xl border border-panel-border bg-panel p-6 shadow-2xl"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
            Week {recap.week} Recap
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">Market Pulse</h2>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-text-dim">Revenue</span>
              <span className={revPct >= 0 ? "text-positive" : "text-negative"}>
                {revPct >= 0 ? "+" : ""}
                {revPct.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between font-mono text-sm">
              <span className="text-text-dim">Valuation</span>
              <span className={valPct >= 0 ? "text-positive" : "text-negative"}>
                {fmtMoney(recap.prevValuation)} → {fmtMoney(recap.prevValuation + recap.valuationDelta)}
              </span>
            </div>

            {recap.eventsSummary.length > 0 && (
              <div className="border-t border-panel-border pt-3">
                <p className="mb-2 text-[10px] uppercase tracking-widest text-text-dim">This Week</p>
                <ul className="space-y-1 text-xs text-text-dim">
                  {recap.eventsSummary.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {recap.resolutions.length > 0 && (
              <div className="border-t border-panel-border pt-3">
                {recap.resolutions.map((r, i) => (
                  <p key={i} className={`text-xs ${r.success ? "text-positive" : "text-negative"}`}>
                    {r.success ? "✓" : "✗"} {r.title} (rolled {(r.roll * 100).toFixed(0)}% vs {(r.threshold * 100).toFixed(0)}%)
                  </p>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
              <p className="text-[10px] uppercase tracking-widest text-accent">Next</p>
              <p className="mt-1 text-sm text-foreground">{recap.cliffhanger}</p>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="mt-6 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-background hover:opacity-90"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}