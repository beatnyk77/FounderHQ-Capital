"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getResourceSnapshot } from "@/lib/game/specialists";
import { computeScore } from "@/lib/game/simulation";
import { getVictoryTracks } from "@/lib/game/victoryTracks";
import type { GameRun } from "@/lib/game/types";

interface Props {
  run: GameRun | null;
  onClaim: () => void;
}

export function VictoryModal({ run, onClaim }: Props) {
  if (!run || run.status !== "victorious") return null;

  const tracks = getVictoryTracks(run).filter((t) => t.complete);
  const resources = getResourceSnapshot(run);
  const score = computeScore({ ...run, status: "exited" });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-xl border border-accent/40 bg-panel p-6 shadow-2xl"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">Victory</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{run.companyName} dominates</h2>
          <p className="mt-2 text-sm text-text-dim">
            Week {run.week} — you completed {tracks.length} strategic paths and seized control of the board.
          </p>

          <div className="mt-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-text-dim">Paths secured</p>
            <ul className="space-y-1">
              {tracks.map((t) => (
                <li key={t.id} className="text-sm text-accent">
                  ✓ {t.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs">
            <span className="text-text-dim">
              Cash <span className="text-foreground">{resources.cash}</span>
            </span>
            <span className="text-text-dim">
              Trust <span className="text-foreground">{resources.trust}</span>
            </span>
            <span className="text-text-dim">
              Influence <span className="text-foreground">{resources.influence}</span>
            </span>
            <span className="text-text-dim">
              Talent <span className="text-foreground">{resources.talent}</span>
            </span>
          </div>

          <p className="mt-4 font-mono text-sm text-accent">{score} pts</p>

          <button
            onClick={onClaim}
            className="mt-5 w-full rounded-xl bg-accent py-3 font-semibold text-background hover:opacity-90"
          >
            Claim Victory
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}