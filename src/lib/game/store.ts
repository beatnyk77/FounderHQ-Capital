"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PULSE_MS, WEEK_MS } from "./constants";
import { recordArchetypeSignal } from "./archetype";
import {
  applyIntegration,
  closeDealRoom,
  executeDealClose,
  openDealRoom,
  runDiligence,
  selectDealStructure,
} from "./dealRoom";
import {
  startFundingCounter,
  submitFundingCounter,
} from "./fundingTheater";
import { investigateArticle } from "./intel";
import { accelerateClose, walkFromTarget } from "./rivalEngine";
import { recordReputationSwing } from "./reputationLedger";
import {
  acceptFunding,
  acquireTarget,
  advanceWeek,
  computeScore,
  createRun,
  resolveReward,
  resolveThreat,
  scoutTarget,
} from "./simulation";
import { freezeTickTimer, resolveTickSchedule } from "./ticker";
import type { GameRun, Industry, LeaderboardEntry, MacroRegime } from "./types";
import { applyVictoryIfEligible, getCompletedTrackIds } from "./victoryTracks";
import { worldPulse } from "./worldPulse";

interface GameStore {
  run: GameRun | null;
  leaderboard: LeaderboardEntry[];
  tickId: ReturnType<typeof setTimeout> | null;
  pulseId: ReturnType<typeof setInterval> | null;
  startRun: (name: string, industry: Industry, regime: MacroRegime) => void;
  startTicker: () => void;
  stopTicker: (saveRemaining?: boolean) => void;
  startPulse: () => void;
  stopPulse: () => void;
  tick: () => void;
  pulse: () => void;
  resume: () => void;
  clearWeekRecap: () => void;
  operate: (action: "hire" | "rd" | "sales" | "cut") => void;
  acceptTermSheet: (eventId: string) => void;
  startTermSheetCounter: (eventId: string) => void;
  submitTermSheetCounter: (eventId: string, preMoney: number) => void;
  declineEvent: (eventId: string) => void;
  buyTarget: (targetId: string) => void;
  outbidTarget: (targetId: string) => void;
  walkFromTarget: (targetId: string) => void;
  accelerateTarget: (targetId: string) => void;
  scoutTarget: (targetId: string) => void;
  investigateIntel: (articleId: string) => void;
  enterDealRoom: (targetId: string) => void;
  dealRoomDiligence: (level: "quick" | "standard" | "deep") => void;
  dealRoomStructure: (structure: "cash" | "stock" | "earnout") => void;
  dealRoomClose: () => void;
  dealRoomIntegrate: (focus: "culture" | "product" | "sales") => void;
  dismissDealRoom: () => void;
  foldRun: () => void;
  claimVictory: () => void;
  abandonRun: () => void;
}

function commitRun(
  set: (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void,
  get: () => GameStore,
  run: GameRun,
) {
  const next = applyVictoryIfEligible(run);
  if (next.status === "victorious") {
    get().stopTicker(true);
    get().stopPulse();
  }
  set({ run: next });
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      run: null,
      leaderboard: [],
      tickId: null,
      pulseId: null,

      startRun: (name, industry, regime) => {
        get().stopTicker();
        get().stopPulse();
        set({ run: createRun(name, industry, regime) });
        get().startTicker();
        get().startPulse();
      },

      startTicker: () => {
        const { tickId, run } = get();
        if (tickId) clearTimeout(tickId);
        if (!run || run.status !== "active" || run.weekRecap) return;

        const now = Date.now();
        const schedule = resolveTickSchedule(
          { nextTickAt: run.nextTickAt, tickRemainingMs: run.tickRemainingMs },
          now,
          WEEK_MS,
        );

        set({
          run: {
            ...run,
            nextTickAt: schedule.nextTickAt,
            tickRemainingMs: schedule.tickRemainingMs,
          },
        });

        const id = setTimeout(() => get().tick(), schedule.delayMs);
        set({ tickId: id });
      },

      stopTicker: (saveRemaining = false) => {
        const { tickId, run } = get();
        if (tickId) clearTimeout(tickId);

        if (saveRemaining && run?.status === "active" && run.nextTickAt) {
          const frozen = freezeTickTimer(
            { nextTickAt: run.nextTickAt, tickRemainingMs: run.tickRemainingMs },
            Date.now(),
          );
          set({
            tickId: null,
            run: { ...run, nextTickAt: frozen.nextTickAt, tickRemainingMs: frozen.tickRemainingMs },
          });
          return;
        }

        set({ tickId: null });
      },

      startPulse: () => {
        const { pulseId } = get();
        if (pulseId) clearInterval(pulseId);
        const id = setInterval(() => get().pulse(), PULSE_MS);
        set({ pulseId: id });
      },

      stopPulse: () => {
        const { pulseId } = get();
        if (pulseId) clearInterval(pulseId);
        set({ pulseId: null });
      },

      pulse: () => {
        const { run } = get();
        if (!run || run.status !== "active" || run.weekRecap) return;
        set({ run: worldPulse(run) });
      },

      tick: () => {
        const { run } = get();
        if (!run || run.status !== "active") return;
        get().stopTicker();
        commitRun(
          set,
          get,
          advanceWeek({
            ...run,
            nextTickAt: null,
            tickRemainingMs: null,
          }),
        );
      },

      resume: () => {
        const { run } = get();
        if (!run) return;
        set({ run: { ...run, status: "active", weekRecap: null } });
        get().startTicker();
        get().startPulse();
      },

      clearWeekRecap: () => {
        const { run } = get();
        if (!run) return;
        set({ run: { ...run, weekRecap: null } });
        if (run.status === "active") {
          get().startTicker();
          get().startPulse();
        }
      },

      operate: (action) => {
        const { run } = get();
        if (!run || run.status === "bankrupt" || run.operateUsedThisWeek) return;

        const patch: Partial<GameRun> = { operateUsedThisWeek: true };
        switch (action) {
          case "hire":
            if (run.cash < 80_000) return;
            patch.cash = run.cash - 80_000;
            patch.employees = run.employees + 2;
            patch.burn = run.burn + 12_000;
            patch.productScore = Math.min(100, run.productScore + 3);
            patch.morale = Math.min(100, run.morale + 3);
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
            break;
        }
        let updated = { ...run, ...patch } as GameRun;
        if (action === "cut") {
          updated = recordReputationSwing(updated, -2, "Layoffs", "Workforce cuts — press notes austerity");
          updated = recordArchetypeSignal(updated, "operator", -1);
        } else if (action === "hire" || action === "rd") {
          updated = recordArchetypeSignal(updated, "operator", 1);
        } else if (action === "sales") {
          updated = recordArchetypeSignal(updated, "visionary", 1);
        }
        commitRun(set, get, updated);
      },

      acceptTermSheet: (eventId) => {
        const { run } = get();
        if (!run) return;
        const event = run.events.find((e) => e.id === eventId);
        if (!event) return;
        commitRun(set, get, acceptFunding(run, event));
      },

      startTermSheetCounter: (eventId) => {
        const { run } = get();
        if (!run) return;
        set({ run: startFundingCounter(run, eventId) });
      },

      submitTermSheetCounter: (eventId, preMoney) => {
        const { run } = get();
        if (!run) return;
        commitRun(set, get, submitFundingCounter(run, eventId, preMoney));
      },

      declineEvent: (eventId) => {
        const { run } = get();
        if (!run) return;
        const event = run.events.find((e) => e.id === eventId);
        if (!event) return;

        if (event.bucket === "reward") {
          commitRun(set, get, resolveReward(run, event));
          return;
        }
        if (event.bucket === "threat") {
          commitRun(set, get, resolveThreat(run, event));
          return;
        }

        commitRun(set, get, {
          ...run,
          status: "active",
          events: run.events.map((e) => (e.id === eventId ? { ...e, resolved: true } : e)),
        });
      },

      buyTarget: (targetId) => {
        const { run } = get();
        if (!run) return;
        commitRun(set, get, acquireTarget(run, targetId));
      },

      outbidTarget: (targetId) => {
        const { run } = get();
        if (!run) return;
        commitRun(set, get, acquireTarget(run, targetId, { outbid: true }));
      },

      walkFromTarget: (targetId) => {
        const { run } = get();
        if (!run) return;
        set({ run: walkFromTarget(run, targetId) });
      },

      accelerateTarget: (targetId) => {
        const { run } = get();
        if (!run) return;
        set({ run: accelerateClose(run, targetId) });
      },

      scoutTarget: (targetId) => {
        const { run } = get();
        if (!run) return;
        set({ run: scoutTarget(run, targetId) });
      },

      investigateIntel: (articleId) => {
        const { run } = get();
        if (!run) return;
        commitRun(set, get, investigateArticle(run, articleId));
      },

      enterDealRoom: (targetId) => {
        const { run } = get();
        if (!run) return;
        set({ run: openDealRoom(run, targetId) });
      },

      dealRoomDiligence: (level) => {
        const { run } = get();
        if (!run) return;
        set({ run: runDiligence(run, level) });
      },

      dealRoomStructure: (structure) => {
        const { run } = get();
        if (!run) return;
        set({ run: selectDealStructure(run, structure) });
      },

      dealRoomClose: () => {
        const { run } = get();
        if (!run) return;
        commitRun(set, get, executeDealClose(run));
      },

      dealRoomIntegrate: (focus) => {
        const { run } = get();
        if (!run) return;
        commitRun(set, get, applyIntegration(run, focus));
      },

      dismissDealRoom: () => {
        const { run } = get();
        if (!run) return;
        set({ run: closeDealRoom(run) });
      },

      foldRun: () => {
        const { run, leaderboard } = get();
        if (!run || run.status === "victorious") return;
        get().stopTicker();
        get().stopPulse();
        const score = computeScore({ ...run, status: "exited" });
        const entry: LeaderboardEntry = {
          companyName: run.companyName,
          score,
          exitType: "fold",
          week: run.week,
          date: new Date().toISOString(),
        };
        set({
          run: null,
          leaderboard: [entry, ...leaderboard].slice(0, 20),
        });
      },

      claimVictory: () => {
        const { run, leaderboard } = get();
        if (!run || run.status !== "victorious") return;
        get().stopTicker();
        get().stopPulse();
        const score = computeScore({ ...run, status: "exited" });
        const entry: LeaderboardEntry = {
          companyName: run.companyName,
          score,
          exitType: "victory",
          week: run.week,
          date: new Date().toISOString(),
          victoryTracks: getCompletedTrackIds(run),
        };
        set({
          run: null,
          leaderboard: [entry, ...leaderboard].slice(0, 20),
        });
      },

      abandonRun: () => {
        get().stopTicker();
        get().stopPulse();
        set({ run: null });
      },
    }),
    {
      name: "founderhq-capital-v2",
      partialize: (s) => ({ leaderboard: s.leaderboard, run: s.run }),
      migrate: (persisted, version) => {
        const state = persisted as { run?: GameRun | null; leaderboard?: LeaderboardEntry[] };
        if (state.run && (!state.run.seed || !state.run.npcs)) {
          state.run = null;
        }
        if (state.run && version < 3) {
          state.run = {
            ...state.run,
            nextTickAt: state.run.nextTickAt ?? null,
            tickRemainingMs: state.run.tickRemainingMs ?? null,
          };
        }
        if (state.run && version < 4) {
          state.run = {
            ...state.run,
            investigations: state.run.investigations ?? [],
            reputationSwings: state.run.reputationSwings ?? [],
            verifiedIntel: state.run.verifiedIntel ?? [],
            publicNarrative: state.run.publicNarrative ?? "",
          };
        }
        if (state.run && version < 5) {
          state.run = {
            ...state.run,
            pulseCount: state.run.pulseCount ?? 0,
            targets: (state.run.targets ?? []).map((t) => ({
              ...t,
              heatLevel: t.heatLevel ?? 0,
              rivalInterest: t.rivalInterest ?? 0,
            })),
          };
        }
        if (state.run && version < 6) {
          state.run = {
            ...state.run,
            dealRoom: state.run.dealRoom ?? null,
            archetype: state.run.archetype ?? {
              aggressiveCapital: 0,
              operator: 0,
              dealmaker: 0,
              visionary: 0,
            },
            archetypeRevealed: state.run.archetypeRevealed ?? false,
            portfolio: state.run.portfolio ?? [],
            npcs: (state.run.npcs ?? []).map((n) => ({
              ...n,
              stance: n.stance ?? "neutral",
              memory: n.memory ?? [],
            })),
          };
        }
        return state as { run: GameRun | null; leaderboard: LeaderboardEntry[] };
      },
      version: 7,
    },
  ),
);