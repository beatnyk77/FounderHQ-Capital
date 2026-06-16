import { MACRO_BASE } from "./constants";
import { seedNPCs } from "./npcs";
import { generateNews } from "./news";
import { createSeed, seededRandom } from "./rng";
import { rollResolution } from "./resolution";
import type {
  AcquisitionTarget,
  CompanyStage,
  GameEvent,
  GameRun,
  Industry,
  MacroRegime,
  MacroState,
  WeekRecap,
} from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

const TARGET_NAMES = ["Nexlify", "Orbital", "Pulseware", "Stackline", "Ventara", "Corebit"];

export function createMacro(regime: MacroRegime, week: number): MacroState {
  const base = MACRO_BASE[regime];
  const drift = Math.sin(week / 12) * 0.05;
  return {
    interestRate: base.rate + drift * 0.01,
    inflation: 0.02 + (regime === "bear" ? 0.02 : 0),
    gdpGrowth: base.gdp + drift * 0.01,
    creditSpread: regime === "bear" ? 0.04 : regime === "neutral" ? 0.025 : 0.015,
    marketSentiment: Math.min(1, Math.max(0, base.sentiment + drift)),
    regulatoryStance: regime === "bear" ? 0.6 : 0.35,
  };
}

export function computeSectorIndex(regime: MacroRegime, week: number, industry: Industry): number {
  const base = 100;
  const macro = createMacro(regime, week);
  const industryBoost: Record<Industry, number> = {
    ai: 1.15,
    fintech: 1.05,
    saas: 1.0,
    healthtech: 1.08,
    climate: 1.1,
    consumer: 0.95,
  };
  return base * industryBoost[industry] * (1 + macro.gdpGrowth * 0.5 + Math.sin(week / 8) * 0.03);
}

export function createTargets(industry: Industry, seed: number): AcquisitionTarget[] {
  return TARGET_NAMES.slice(0, 4).map((name, i) => ({
    id: `target-${i}`,
    name,
    industry,
    valuation: 2_000_000 + seededRandom(seed, i, `target-val-${name}`) * 8_000_000,
    healthScore: 40 + seededRandom(seed, i, `target-health-${name}`) * 50,
    synergy: 10 + seededRandom(seed, i, `target-syn-${name}`) * 30,
  }));
}

export function createRun(companyName: string, industry: Industry, regime: MacroRegime): GameRun {
  const seed = createSeed();
  const macro = createMacro(regime, 0);
  return {
    id: uid(),
    seed,
    companyName,
    industry,
    regime,
    status: "active",
    week: 0,
    cash: 500_000,
    burn: 45_000,
    revenue: 8_000,
    valuation: 2_000_000,
    productScore: 35,
    morale: 70,
    marketShare: 2,
    employees: 8,
    reputation: 50,
    stage: "pre_seed",
    totalRaised: 0,
    peakValuation: 2_000_000,
    founderOwnership: 100,
    sectorIndex: computeSectorIndex(regime, 0, industry),
    macro,
    npcs: seedNPCs(seed),
    events: [],
    news: [],
    targets: createTargets(industry, seed),
    scoutedTargets: [],
    rounds: [],
    acquisitions: 0,
    valuationHistory: [2_000_000],
    weekRecap: null,
    operateUsedThisWeek: false,
    nextTickAt: null,
    tickRemainingMs: null,
    score: 0,
    startedAt: Date.now(),
  };
}

function nextStage(stage: CompanyStage): CompanyStage {
  const order: CompanyStage[] = ["pre_seed", "seed", "series_a", "series_b", "growth"];
  const i = order.indexOf(stage);
  return order[Math.min(i + 1, order.length - 1)];
}

function eventForBucket(
  bucket: GameEvent["bucket"],
  run: GameRun,
): Omit<GameEvent, "id" | "resolved"> {
  const week = run.week + 1;
  const expires = week + 2;
  const vc = run.npcs.find((n) => n.role === "vc");

  if (bucket === "opportunity" && run.stage !== "growth") {
    const amount = run.valuation * (0.15 + run.macro.marketSentiment * 0.1);
    return {
      week,
      bucket,
      title: `${vc?.name ?? "VC"} sends term sheet`,
      description: `Offer: $${(amount / 1e6).toFixed(1)}M at $${(run.valuation / 1e6).toFixed(1)}M pre-money. Board seat included.`,
      expiresAtWeek: expires,
      payload: { roundType: run.stage === "pre_seed" ? "seed" : "series_a", amount, preMoney: run.valuation },
    };
  }
  if (bucket === "threat") {
    return {
      week,
      bucket,
      title: "Burn spike",
      description: `Operating costs jump 8% — runway tightens. Mitigate before costs compound.`,
      expiresAtWeek: expires,
      payload: { burnSpikeApplied: false },
    };
  }
  if (bucket === "reward") {
    return {
      week,
      bucket,
      title: "Customer win",
      description: `Enterprise deal could add ~$${(run.revenue * 0.15 / 1000).toFixed(0)}K MRR if closed.`,
      expiresAtWeek: expires,
    };
  }
  const rival = run.npcs.find((n) => n.role === "rival");
  const target = run.targets[Math.floor(seededRandom(run.seed, week, "uncertainty-target") * run.targets.length)];
  return {
    week,
    bucket,
    title: "Acquisition rumor",
    description: `${target?.name ?? "Rival"} may be open to talks. ${rival?.name ?? "A rival"} also circling.`,
    expiresAtWeek: expires,
    payload: target ? { targetId: target.id, targetName: target.name, price: target.valuation } : undefined,
  };
}

export function generateWeeklyEvents(run: GameRun): GameEvent[] {
  const buckets: GameEvent["bucket"][] = ["opportunity", "threat", "reward", "uncertainty"];
  return buckets.map((bucket) => ({ id: uid(), resolved: false, ...eventForBucket(bucket, run) }));
}

export function processExpiredEvents(run: GameRun): GameRun {
  let reputation = run.reputation;
  const events = run.events.map((e) => {
    if (e.resolved || run.week + 1 <= e.expiresAtWeek) return e;
    if (e.bucket === "opportunity" || e.bucket === "uncertainty") {
      reputation = Math.max(0, reputation - 5);
      return { ...e, resolved: true };
    }
    return e;
  });
  return { ...run, events, reputation };
}

export function tickCompany(run: GameRun): Partial<GameRun> {
  const macro = createMacro(run.regime, run.week + 1);
  let { cash, burn, revenue, morale, productScore, marketShare, valuation, reputation } = run;

  revenue *= 1 + productScore / 500 + macro.gdpGrowth * 0.02;
  burn *= 1 + macro.inflation * 0.3;
  cash += revenue - burn;

  const unresolvedThreat = run.events.some((e) => e.bucket === "threat" && !e.resolved && e.week <= run.week + 1);
  if (unresolvedThreat) burn *= 1.04;

  morale = Math.min(100, Math.max(20, morale + (revenue > burn ? 2 : -3)));
  productScore = Math.min(100, productScore + (run.week % 4 === 0 ? 1 : 0));
  marketShare = Math.min(40, marketShare + productScore / 2000);

  valuation =
    revenue * 12 * (1 + macro.marketSentiment) * (1 + productScore / 100) * (1 + marketShare / 50);

  const peakValuation = Math.max(run.peakValuation, valuation);
  const status = cash <= 0 ? "bankrupt" : run.status;
  const sectorIndex = computeSectorIndex(run.regime, run.week + 1, run.industry);

  return {
    week: run.week + 1,
    cash,
    burn,
    revenue,
    morale,
    productScore,
    marketShare,
    valuation,
    peakValuation,
    macro,
    reputation,
    status,
    sectorIndex,
    operateUsedThisWeek: false,
  };
}

function buildCliffhanger(run: GameRun): string {
  const rival = run.npcs.find((n) => n.role === "rival");
  const pending = run.events.filter((e) => !e.resolved && (e.bucket === "opportunity" || e.bucket === "uncertainty"));
  if (pending.length > 0) {
    const e = pending[0];
    return `${e.title} — decision needed before week ${e.expiresAtWeek}.`;
  }
  const target = run.targets[0];
  if (target && rival) {
    return `Rumor: ${rival.name} scouting ${target.name} for potential bid.`;
  }
  return `Markets watch ${run.companyName} as ${run.regime} conditions persist.`;
}

export function advanceWeek(run: GameRun): GameRun {
  if (run.status !== "active") return run;

  const prevRevenue = run.revenue;
  const prevValuation = run.valuation;

  let working = processExpiredEvents(run);
  const updates = tickCompany(working);
  working = { ...working, ...updates };

  const newEvents = generateWeeklyEvents(working);

  // Apply one-time burn spike for new threat events
  let burn = working.burn;
  const eventsWithSpike = newEvents.map((e) => {
    if (e.bucket === "threat" && !e.payload?.burnSpikeApplied) {
      burn *= 1.08;
      return { ...e, payload: { ...e.payload, burnSpikeApplied: true } };
    }
    return e;
  });
  working = { ...working, burn };

  const news = eventsWithSpike.map((e) =>
    generateNews(e, working.companyName, working.industry, working.macro, working),
  );

  const valuationHistory = [...working.valuationHistory, working.valuation].slice(-12);
  const needsPause = eventsWithSpike.some((e) => e.bucket === "opportunity" || e.bucket === "uncertainty");

  const eventsSummary = eventsWithSpike.map((e) => `${e.bucket}: ${e.title}`);
  const weekRecap: WeekRecap = {
    week: working.week,
    prevRevenue,
    prevValuation,
    revenueDelta: working.revenue - prevRevenue,
    valuationDelta: working.valuation - prevValuation,
    eventsSummary,
    resolutions: [],
    cliffhanger: buildCliffhanger({ ...working, events: [...working.events, ...eventsWithSpike] }),
  };

  return {
    ...working,
    status: needsPause ? "paused" : (working.status ?? run.status),
    events: [...working.events, ...eventsWithSpike].slice(-24),
    news: [...news, ...working.news].slice(0, 30),
    valuationHistory,
    weekRecap,
  };
}

export function computeScore(run: GameRun): number {
  const efficiency = run.totalRaised > 0 ? run.revenue / run.totalRaised : 0;
  return Math.round(
    run.peakValuation / 1e6 * 0.4 +
      efficiency * 1e6 * 0.2 +
      run.reputation * 0.1 +
      run.acquisitions * 5,
  );
}

export function acceptFunding(run: GameRun, event: GameEvent): GameRun {
  const rolled = rollResolution(run, "term_sheet", event.id, event);
  const vc = run.npcs.find((n) => n.role === "vc");

  if (!rolled.success) {
    return {
      ...run,
      status: "active",
      reputation: Math.max(0, run.reputation - 8),
      npcs: run.npcs.map((n) => (n.role === "vc" ? { ...n, trust: Math.max(0, n.trust - 15) } : n)),
      events: run.events.map((e) =>
        e.id === event.id ? { ...e, resolved: true, resolution: rolled.resolution } : e,
      ),
      weekRecap: run.weekRecap
        ? {
            ...run.weekRecap,
            resolutions: [
              ...run.weekRecap.resolutions,
              {
                title: `${vc?.name ?? "VC"} passed — deal collapsed`,
                success: false,
                roll: rolled.roll,
                threshold: rolled.threshold,
              },
            ],
          }
        : null,
    };
  }

  const amount = event.payload?.amount ?? 0;
  const preMoney = event.payload?.preMoney ?? run.valuation;
  const dilution = amount / (preMoney + amount);
  const newOwnership = run.founderOwnership * (1 - dilution);

  return {
    ...run,
    status: "active",
    cash: run.cash + amount,
    totalRaised: run.totalRaised + amount,
    founderOwnership: newOwnership,
    valuation: preMoney + amount,
    stage: nextStage(run.stage),
    reputation: Math.min(100, run.reputation + 5),
    npcs: run.npcs.map((n) => (n.role === "vc" ? { ...n, trust: Math.min(100, n.trust + 10) } : n)),
    rounds: [
      ...run.rounds,
      { type: event.payload?.roundType ?? "seed", amount, preMoney, week: run.week },
    ],
    events: run.events.map((e) =>
      e.id === event.id ? { ...e, resolved: true, resolution: rolled.resolution } : e,
    ),
    weekRecap: run.weekRecap
      ? {
          ...run.weekRecap,
          resolutions: [
            ...run.weekRecap.resolutions,
            {
              title: `${vc?.name ?? "VC"} term sheet closed`,
              success: true,
              roll: rolled.roll,
              threshold: rolled.threshold,
            },
          ],
        }
      : null,
  };
}

export function resolveReward(run: GameRun, event: GameEvent): GameRun {
  const rolled = rollResolution(run, "customer_win", event.id, event);

  return {
    ...run,
    status: "active",
    revenue: rolled.success ? run.revenue * 1.15 : run.revenue,
    reputation: rolled.success ? Math.min(100, run.reputation + 3) : run.reputation,
    events: run.events.map((e) =>
      e.id === event.id ? { ...e, resolved: true, resolution: rolled.resolution } : e,
    ),
    weekRecap: run.weekRecap
      ? {
          ...run.weekRecap,
          resolutions: [
            ...run.weekRecap.resolutions,
            {
              title: rolled.success ? "Enterprise deal closed" : "Customer win slipped",
              success: rolled.success,
              roll: rolled.roll,
              threshold: rolled.threshold,
            },
          ],
        }
      : null,
  };
}

export function resolveThreat(run: GameRun, event: GameEvent): GameRun {
  const rolled = rollResolution(run, "threat_mitigate", event.id, event);

  return {
    ...run,
    status: "active",
    reputation: rolled.success
      ? Math.min(100, run.reputation + 2)
      : Math.max(0, run.reputation - 3),
    events: run.events.map((e) =>
      e.id === event.id ? { ...e, resolved: true, resolution: rolled.resolution } : e,
    ),
    weekRecap: run.weekRecap
      ? {
          ...run.weekRecap,
          resolutions: [
            ...run.weekRecap.resolutions,
            {
              title: rolled.success ? "Burn spike mitigated" : "Threat persists",
              success: rolled.success,
              roll: rolled.roll,
              threshold: rolled.threshold,
            },
          ],
        }
      : null,
  };
}

export function acquireTarget(run: GameRun, targetId: string): GameRun {
  const target = run.targets.find((t) => t.id === targetId);
  if (!target || run.cash < target.valuation * 0.3) return run;

  const rolled = rollResolution(run, "ma_close", targetId, undefined, target);
  const price = target.valuation * 0.8;

  if (!rolled.success) {
    const breakupFee = price * 0.05;
    return {
      ...run,
      status: "active",
      cash: run.cash - breakupFee,
      reputation: Math.max(0, run.reputation - 5),
      events: run.events.map((e) =>
        e.payload?.targetId === targetId ? { ...e, resolved: true, resolution: rolled.resolution } : e,
      ),
      weekRecap: run.weekRecap
        ? {
            ...run.weekRecap,
            resolutions: [
              ...run.weekRecap.resolutions,
              {
                title: `${target.name} deal fell through`,
                success: false,
                roll: rolled.roll,
                threshold: rolled.threshold,
              },
            ],
          }
        : null,
    };
  }

  return {
    ...run,
    status: "active",
    cash: run.cash - price,
    employees: run.employees + 5,
    productScore: Math.min(100, run.productScore + target.synergy / 3),
    marketShare: Math.min(40, run.marketShare + 2),
    acquisitions: run.acquisitions + 1,
    reputation: Math.min(100, run.reputation + 3),
    valuation: run.valuation + target.synergy * 50_000,
    targets: run.targets.filter((t) => t.id !== targetId),
    events: run.events.map((e) =>
      e.payload?.targetId === targetId ? { ...e, resolved: true, resolution: rolled.resolution } : e,
    ),
    weekRecap: run.weekRecap
      ? {
          ...run.weekRecap,
          resolutions: [
            ...run.weekRecap.resolutions,
            {
              title: `Acquired ${target.name}`,
              success: true,
              roll: rolled.roll,
              threshold: rolled.threshold,
            },
          ],
        }
      : null,
  };
}

export function scoutTarget(run: GameRun, targetId: string): GameRun {
  const target = run.targets.find((t) => t.id === targetId);
  if (!target || run.cash < 25_000 || run.scoutedTargets.includes(targetId)) return run;

  return {
    ...run,
    cash: run.cash - 25_000,
    scoutedTargets: [...run.scoutedTargets, targetId],
  };
}