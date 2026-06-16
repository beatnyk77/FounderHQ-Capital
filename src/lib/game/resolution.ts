import type { AcquisitionTarget, ActionType, GameEvent, GameRun, OddsBreakdown } from "./types";
import { seededRandom } from "./rng";

const BASE_ODDS: Record<ActionType, number> = {
  term_sheet: 0.55,
  ma_close: 0.45,
  customer_win: 0.7,
  threat_mitigate: 0.6,
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function computeOdds(
  action: ActionType,
  run: GameRun,
  event?: GameEvent,
  target?: AcquisitionTarget,
): OddsBreakdown {
  const base = BASE_ODDS[action];
  const modifiers: OddsBreakdown["modifiers"] = [];

  if (action === "term_sheet") {
    if (run.reputation > 70) modifiers.push({ label: "Reputation", value: 0.07 });
    if (run.rounds.length > 0) modifiers.push({ label: "Prior round", value: 0.1 });
    if (run.regime === "bear") modifiers.push({ label: "Bear market", value: -0.1 });
    if (run.regime === "bull") modifiers.push({ label: "Bull market", value: 0.05 });
    const vc = run.npcs.find((n) => n.role === "vc");
    if (vc && vc.trust > 60) modifiers.push({ label: `${vc.name} trust`, value: 0.05 });
  }

  if (action === "ma_close" && target) {
    if (run.cash > target.valuation * 0.5) modifiers.push({ label: "Strong cash", value: 0.15 });
    if (target.synergy > 25) modifiers.push({ label: "High synergy", value: 0.1 });
    if (target.healthScore < 50) modifiers.push({ label: "Poor health", value: -0.15 });
    if (run.scoutedTargets.includes(target.id)) modifiers.push({ label: "Scouted", value: 0.08 });
    if (run.regime === "bear") modifiers.push({ label: "Bear market", value: -0.08 });
  }

  if (action === "customer_win") {
    if (run.productScore > 60) modifiers.push({ label: "Product strength", value: 0.15 });
    if (run.operateUsedThisWeek) modifiers.push({ label: "Active ops", value: 0.05 });
  }

  if (action === "threat_mitigate") {
    if (run.burn < run.revenue * 1.2) modifiers.push({ label: "Lean ops", value: 0.1 });
    if (run.morale < 40) modifiers.push({ label: "Low morale", value: -0.1 });
    if (event?.payload?.burnSpikeApplied) modifiers.push({ label: "Burn spike", value: -0.05 });
  }

  const modSum = modifiers.reduce((s, m) => s + m.value, 0);
  return { base, modifiers, final: clamp(base + modSum, 0.05, 0.95) };
}

export function rollResolution(
  run: GameRun,
  action: ActionType,
  salt: string,
  event?: GameEvent,
  target?: AcquisitionTarget,
) {
  const odds = computeOdds(action, run, event, target);
  const roll = seededRandom(run.seed, run.week, salt);
  const success = roll < odds.final;
  return {
    ...odds,
    roll,
    threshold: odds.final,
    success,
    resolution: {
      success,
      roll,
      threshold: odds.final,
      modifiers: odds.modifiers,
    },
  };
}