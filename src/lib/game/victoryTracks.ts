import type { GameRun } from "./types";

export type VictoryTrackId = "acquire" | "markets" | "regulators" | "dominate";

export interface VictoryTrack {
  id: VictoryTrackId;
  label: string;
  progress: number;
  complete: boolean;
  detail: string;
}

export const VICTORY_REQUIRED = 2;

const THRESHOLDS = {
  acquire: { acquisitions: 2 },
  markets: { marketShare: 15 },
  regulators: { reputation: 60, avgNpcTrust: 55 },
  dominate: { marketShare: 20, peakValuation: 6_000_000, acquisitions: 1 },
} as const;

function avgNpcTrust(run: GameRun): number {
  if (run.npcs.length === 0) return 0;
  return run.npcs.reduce((sum, n) => sum + n.trust, 0) / run.npcs.length;
}

function hasVerifiedRegulatoryIntel(run: GameRun): boolean {
  return run.news.some(
    (a) => a.intelType === "regulatory" && run.verifiedIntel.includes(a.id),
  );
}

function trackAcquire(run: GameRun): VictoryTrack {
  const current = run.acquisitions;
  const target = THRESHOLDS.acquire.acquisitions;
  return {
    id: "acquire",
    label: "Acquire competitors",
    progress: Math.min(1, current / target),
    complete: current >= target,
    detail: `${current}/${target} acquisitions`,
  };
}

function trackMarkets(run: GameRun): VictoryTrack {
  const current = run.marketShare;
  const target = THRESHOLDS.markets.marketShare;
  return {
    id: "markets",
    label: "Capture markets",
    progress: Math.min(1, current / target),
    complete: current >= target,
    detail: `${current.toFixed(1)}% / ${target}% influence`,
  };
}

function trackRegulators(run: GameRun): VictoryTrack {
  const trustOk = run.reputation >= THRESHOLDS.regulators.reputation;
  const intelOk = hasVerifiedRegulatoryIntel(run);
  const npcOk = avgNpcTrust(run) >= THRESHOLDS.regulators.avgNpcTrust;
  const complete = trustOk && (intelOk || npcOk);
  const repProgress = run.reputation / THRESHOLDS.regulators.reputation;
  const secondaryProgress = intelOk || npcOk ? 1 : Math.max(
    hasVerifiedRegulatoryIntel(run) ? 0 : 0,
    avgNpcTrust(run) / THRESHOLDS.regulators.avgNpcTrust,
  );
  return {
    id: "regulators",
    label: "Control regulators",
    progress: complete ? 1 : Math.min(1, (repProgress + secondaryProgress) / 2),
    complete,
    detail: trustOk
      ? intelOk || npcOk
        ? "Regulatory grip secured"
        : "Trust high — need lobby brief or political ally"
      : `Trust ${run.reputation}/${THRESHOLDS.regulators.reputation}`,
  };
}

function trackDominate(run: GameRun): VictoryTrack {
  const shareOk = run.marketShare >= THRESHOLDS.dominate.marketShare;
  const valOk = run.peakValuation >= THRESHOLDS.dominate.peakValuation;
  const acqOk = run.acquisitions >= THRESHOLDS.dominate.acquisitions;
  const complete = shareOk && valOk && acqOk;
  const parts = [
    run.marketShare / THRESHOLDS.dominate.marketShare,
    run.peakValuation / THRESHOLDS.dominate.peakValuation,
    run.acquisitions / THRESHOLDS.dominate.acquisitions,
  ];
  return {
    id: "dominate",
    label: "Dominate industry",
    progress: complete ? 1 : Math.min(1, parts.reduce((a, b) => a + b, 0) / 3),
    complete,
    detail: `${run.marketShare.toFixed(1)}% share · $${(run.peakValuation / 1e6).toFixed(1)}M peak · ${run.acquisitions} acq`,
  };
}

export function getVictoryTracks(run: GameRun): VictoryTrack[] {
  return [trackAcquire(run), trackMarkets(run), trackRegulators(run), trackDominate(run)];
}

export function getCompletedTrackCount(run: GameRun): number {
  return getVictoryTracks(run).filter((t) => t.complete).length;
}

export function hasWon(run: GameRun): boolean {
  return getCompletedTrackCount(run) >= VICTORY_REQUIRED;
}

export function getCompletedTrackIds(run: GameRun): VictoryTrackId[] {
  return getVictoryTracks(run).filter((t) => t.complete).map((t) => t.id);
}

export function applyVictoryIfEligible(run: GameRun): GameRun {
  if (run.status === "bankrupt" || run.status === "victorious" || run.status === "exited") {
    return run;
  }
  if (!hasWon(run)) return run;
  return { ...run, status: "victorious" };
}