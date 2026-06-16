import { getReputationTier } from "@/lib/design/tokens";
import type { GameRun } from "./types";

const MAX_SWINGS = 8;

export function buildPublicNarrative(run: GameRun): string {
  const tier = getReputationTier(run.reputation);
  const recent = run.reputationSwings.slice(0, 3);
  const netRecent = recent.reduce((sum, s) => sum + s.delta, 0);

  if (run.acquisitions >= 2) {
    return netRecent < -5
      ? `${tier} serial acquirer — integration questions linger in the press`
      : `${tier} roll-up operator gaining market attention`;
  }
  if (run.totalRaised > 0 && run.reputation >= 60) {
    return `${tier} capital-backed founder with strong investor signal`;
  }
  if (netRecent <= -8) {
    return `${tier} founder under scrutiny after a rough news cycle`;
  }
  if (netRecent >= 8) {
    return `${tier} founder riding positive momentum in ${run.industry}`;
  }
  return `${tier} ${run.industry} founder — market still forming a view`;
}

export function recordReputationSwing(
  run: GameRun,
  delta: number,
  source: string,
  narrative: string,
): GameRun {
  if (delta === 0) return run;

  const reputation = Math.min(100, Math.max(0, run.reputation + delta));
  const swing = { week: run.week, delta, source, narrative };
  const reputationSwings = [swing, ...run.reputationSwings].slice(0, MAX_SWINGS);
  const updated = { ...run, reputation, reputationSwings };

  return { ...updated, publicNarrative: buildPublicNarrative(updated) };
}

export function reputationTierOddsModifier(reputation: number): number {
  if (reputation >= 80) return 0.05;
  if (reputation >= 60) return 0.03;
  if (reputation < 30) return -0.08;
  if (reputation < 40) return -0.04;
  return 0;
}

export function canAccessPremiumDeals(reputation: number): boolean {
  return reputation >= 40;
}