import { pickOutlet } from "./npcs";
import { recordReputationSwing } from "./reputationLedger";
import { seededRandom } from "./rng";
import type { AcquisitionTarget, GameRun, NewsArticle } from "./types";

export function defaultTargetFields(
  target: Omit<AcquisitionTarget, "heatLevel" | "rivalInterest"> & Partial<Pick<AcquisitionTarget, "heatLevel" | "rivalInterest">>,
): AcquisitionTarget {
  return {
    ...target,
    heatLevel: target.heatLevel ?? 0,
    rivalInterest: target.rivalInterest ?? 0,
  };
}

export function bumpHeatOnScout(target: AcquisitionTarget, week: number): AcquisitionTarget {
  return {
    ...target,
    heatLevel: Math.min(100, target.heatLevel + 28),
    rivalInterest: Math.min(100, target.rivalInterest + 18),
    expiresAtWeek: week + 4,
  };
}

export function decayTargetHeat(target: AcquisitionTarget): AcquisitionTarget {
  return {
    ...target,
    heatLevel: Math.max(0, target.heatLevel - 4),
    rivalInterest: Math.max(0, target.rivalInterest - 2),
  };
}

function rivalAggression(run: GameRun): number {
  const rival = run.npcs.find((n) => n.role === "rival");
  const base = run.regime === "bull" ? 0.12 : run.regime === "bear" ? 0.06 : 0.09;
  const repFactor = run.reputation > 60 ? 0.04 : 0;
  const trustFactor = rival && rival.trust < 40 ? 0.05 : 0;
  return base + repFactor + trustFactor;
}

export function tickTargetRival(
  run: GameRun,
  target: AcquisitionTarget,
  pulseIndex: number,
): AcquisitionTarget {
  if (!run.scoutedTargets.includes(target.id) && target.heatLevel < 10) return target;

  let updated = decayTargetHeat(target);
  const roll = seededRandom(run.seed, run.week, `rival-${target.id}-${pulseIndex}`);
  const aggression = rivalAggression(run);

  if (roll < aggression) {
    updated = {
      ...updated,
      rivalInterest: Math.min(100, updated.rivalInterest + 12),
      heatLevel: Math.min(100, updated.heatLevel + 8),
    };
  }

  if (updated.heatLevel >= 72 && !updated.rivalBid && roll > 0.55) {
    updated = {
      ...updated,
      rivalBid: updated.valuation * 0.82,
    };
  }

  return updated;
}

export function tickAllRivalMoves(run: GameRun, pulseIndex: number): GameRun {
  return {
    ...run,
    targets: run.targets.map((t) => tickTargetRival(run, t, pulseIndex)),
  };
}

export function heatOddsModifier(target: AcquisitionTarget): number {
  if (target.rivalBid) return -0.06;
  if (target.heatLevel >= 80) return 0.05;
  if (target.heatLevel >= 50) return 0.03;
  return 0;
}

export function walkFromTarget(run: GameRun, targetId: string): GameRun {
  const target = run.targets.find((t) => t.id === targetId);
  if (!target) return run;

  const rival = run.npcs.find((n) => n.role === "rival");
  let next = recordReputationSwing(
    run,
    -4,
    rival?.name ?? "Rival",
    `Let ${target.name} go — rival capitalizes`,
  );

  return {
    ...next,
    marketShare: Math.max(0, next.marketShare - 0.5),
    targets: next.targets.filter((t) => t.id !== targetId),
    scoutedTargets: next.scoutedTargets.filter((id) => id !== targetId),
    events: next.events.map((e) =>
      e.payload?.targetId === targetId ? { ...e, resolved: true } : e,
    ),
  };
}

export function accelerateClose(run: GameRun, targetId: string): GameRun {
  const target = run.targets.find((t) => t.id === targetId);
  if (!target) return run;

  let next = recordReputationSwing(run, -2, target.name, "Accelerated close — aggressive posture noted");

  return {
    ...next,
    targets: next.targets.map((t) =>
      t.id === targetId
        ? { ...t, heatLevel: Math.min(100, t.heatLevel + 15), rivalInterest: Math.min(100, t.rivalInterest + 5) }
        : t,
    ),
  };
}

export function buildRivalBidHeadline(run: GameRun, target: AcquisitionTarget): NewsArticle | null {
  if (!target.rivalBid) return null;
  const rival = run.npcs.find((n) => n.role === "rival");
  const outlet = pickOutlet(run.seed, run.week + run.pulseCount);

  return {
    id: `ambient-rival-${target.id}-${run.pulseCount}`,
    week: run.week,
    headline: `${rival?.name ?? "Rival CEO"} submits bid on ${target.name} — auction heating up`,
    body: `Sources say terms near $${(target.rivalBid / 1e6).toFixed(1)}M. Your window is narrowing.`,
    outlet,
    sentiment: "negative",
    intelType: "competitive",
    verifiable: true,
    verificationCost: 15_000,
    truthState: "confirmed",
    relatedTargetId: target.id,
    intelModifier: { action: "ma_close", value: 0.06, label: "Rival bid confirmed" },
  };
}