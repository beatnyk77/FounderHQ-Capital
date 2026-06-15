"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WEEK_MS } from "./constants";
import {
  acceptFunding,
  acquireTarget,
  advanceWeek,
  computeScore,
  createRun,
} from "./simulation";
import type { GameEvent, GameRun, Industry, LeaderboardEntry, MacroRegime } from "./types";

interface GameStore {
  run: GameRun | null;
  leaderboard: LeaderboardEntry[];
  tickId: ReturnType<typeof setInterval> | null;
  startRun: (name: string, industry: Industry, regime: MacroRegime) => void;
  startTicker: () => void;
  stopTicker: () => void;
  tick: () => void;
  resume: () => void;
  operate: (action: "hire" | "rd" | "sales" | "cut") => void;
  acceptTermSheet: (eventId: string) => void;
  declineEvent: (eventId: string) => void;
  buyTarget: (targetId: string) => void;
  exitRun: () => void;
  abandonRun: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      run: null,
      leaderboard: [],
      tickId: null,

      startRun: (name, industry, regime) => {
        get().stopTicker();
        set({ run: createRun(name, industry, regime) });
        get().startTicker();
      },

      startTicker: () => {
        const { tickId } = get();
        if (tickId) clearInterval(tickId);
        const id = setInterval(() => get().tick(), WEEK_MS);
        set({ tickId: id });
      },

      stopTicker: () => {
        const { tickId } = get();
        if (tickId) clearInterval(tickId);
        set({ tickId: null });
      },

      tick: () => {
        const { run } = get();
        if (!run || run.status !== "active") return;
        set({ run: advanceWeek(run) });
      },

      resume: () => {
        const { run } = get();
        if (!run) return;
        set({ run: { ...run, status: "active" } });
      },

      operate: (action) => {
        const { run } = get();
        if (!run || run.status === "bankrupt") return;

        const patch: Partial<GameRun> = {};
        switch (action) {
          case "hire":
            if (run.cash < 80_000) return;
            patch.cash = run.cash - 80_000;
            patch.employees = run.employees + 2;
            patch.burn = run.burn + 12_000;
            patch.productScore = Math.min(100, run.productScore + 3);
            break;
          case "rd":
            if (run.cash < 50_000) return;
            patch.cash = run.cash - 50_000;
            patch.productScore = Math.min(100, run.productScore + 5);
            patch.burn = run.burn + 5_000;
            break;
          case "sales":
            if (run.cash < 30_000) return;
            patch.cash = run.cash - 30_000;
            patch.revenue = run.revenue * 1.08;
            patch.marketShare = Math.min(40, run.marketShare + 0.5);
            break;
          case "cut":
            patch.burn = run.burn * 0.9;
            patch.morale = Math.max(20, run.morale - 8);
            patch.reputation = Math.max(0, run.reputation - 2);
            break;
        }
        set({ run: { ...run, ...patch } });
      },

      acceptTermSheet: (eventId) => {
        const { run } = get();
        if (!run) return;
        const event = run.events.find((e) => e.id === eventId);
        if (!event) return;
        set({ run: acceptFunding(run, event) });
      },

      declineEvent: (eventId) => {
        const { run } = get();
        if (!run) return;
        set({
          run: {
            ...run,
            status: "active",
            events: run.events.map((e) => (e.id === eventId ? { ...e, resolved: true } : e)),
          },
        });
      },

      buyTarget: (targetId) => {
        const { run } = get();
        if (!run) return;
        set({ run: acquireTarget(run, targetId) });
      },

      exitRun: () => {
        const { run, leaderboard } = get();
        if (!run) return;
        get().stopTicker();
        const score = computeScore({ ...run, status: "exited" });
        const entry: LeaderboardEntry = {
          companyName: run.companyName,
          score,
          exitType: "strategic",
          week: run.week,
          date: new Date().toISOString(),
        };
        set({
          run: null,
          leaderboard: [entry, ...leaderboard].slice(0, 20),
        });
      },

      abandonRun: () => {
        get().stopTicker();
        set({ run: null });
      },
    }),
    { name: "founderhq-capital", partialize: (s) => ({ leaderboard: s.leaderboard }) },
  ),
);