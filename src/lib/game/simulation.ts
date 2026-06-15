import { MACRO_BASE } from "./constants";
import { generateNews } from "./news";
import type {
  AcquisitionTarget,
  CompanyStage,
  GameEvent,
  GameRun,
  Industry,
  MacroRegime,
  MacroState,
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

export function createTargets(industry: Industry): AcquisitionTarget[] {
  return TARGET_NAMES.slice(0, 4).map((name, i) => ({
    id: `target-${i}`,
    name,
    industry,
    valuation: 2_000_000 + Math.random() * 8_000_000,
    healthScore: 40 + Math.random() * 50,
    synergy: 10 + Math.random() * 30,
  }));
}

export function createRun(companyName: string, industry: Industry, regime: MacroRegime): GameRun {
  const macro = createMacro(regime, 0);
  return {
    id: uid(),
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
    macro,
    events: [],
    news: [],
    targets: createTargets(industry),
    rounds: [],
    acquisitions: 0,
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

  if (bucket === "opportunity" && run.stage !== "growth") {
    const amount = run.valuation * (0.15 + run.macro.marketSentiment * 0.1);
    return {
      week,
      bucket,
      title: `${run.stage === "pre_seed" ? "Angel" : "VC"} term sheet incoming`,
      description: `Investors offer $${(amount / 1e6).toFixed(1)}M at $${(run.valuation / 1e6).toFixed(1)}M pre-money.`,
      expiresAtWeek: expires,
      payload: { roundType: run.stage === "pre_seed" ? "seed" : "series_a", amount, preMoney: run.valuation },
    };
  }
  if (bucket === "threat") {
    return {
      week,
      bucket,
      title: "Burn spike",
      description: `Operating costs jump 8% — runway tightens.`,
      expiresAtWeek: expires,
    };
  }
  if (bucket === "reward") {
    return {
      week,
      bucket,
      title: "Customer win",
      description: `Enterprise deal adds $${(run.revenue * 0.15 / 1000).toFixed(0)}K MRR.`,
      expiresAtWeek: expires,
    };
  }
  const target = run.targets[Math.floor(Math.random() * run.targets.length)];
  return {
    week,
    bucket,
    title: "Acquisition rumor",
    description: `${target?.name ?? "Rival"} may be open to talks at $${((target?.valuation ?? 3e6) / 1e6).toFixed(1)}M.`,
    expiresAtWeek: expires,
    payload: target ? { targetId: target.id, targetName: target.name, price: target.valuation } : undefined,
  };
}

export function generateWeeklyEvents(run: GameRun): GameEvent[] {
  const buckets: GameEvent["bucket"][] = ["opportunity", "threat", "reward", "uncertainty"];
  return buckets.map((bucket) => ({ id: uid(), resolved: false, ...eventForBucket(bucket, run) }));
}

export function tickCompany(run: GameRun): Partial<GameRun> {
  const macro = createMacro(run.regime, run.week + 1);
  let { cash, burn, revenue, morale, productScore, marketShare, valuation, reputation } = run;

  revenue *= 1 + (productScore / 500) + macro.gdpGrowth * 0.02;
  burn *= 1 + macro.inflation * 0.3;
  cash += revenue - burn;

  const unresolvedThreat = run.events.some((e) => e.bucket === "threat" && !e.resolved && e.week <= run.week);
  if (unresolvedThreat) burn *= 1.04;

  morale = Math.min(100, Math.max(20, morale + (revenue > burn ? 2 : -3)));
  productScore = Math.min(100, productScore + (run.week % 4 === 0 ? 1 : 0));
  marketShare = Math.min(40, marketShare + productScore / 2000);

  valuation =
    revenue * 12 * (1 + macro.marketSentiment) * (1 + productScore / 100) * (1 + marketShare / 50);

  const peakValuation = Math.max(run.peakValuation, valuation);
  const status = cash <= 0 ? "bankrupt" : run.status;

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
  };
}

export function advanceWeek(run: GameRun): GameRun {
  if (run.status !== "active") return run;

  const updates = tickCompany(run);
  const newEvents = generateWeeklyEvents({ ...run, ...updates });
  const news = newEvents.map((e) =>
    generateNews(e, run.companyName, run.industry, updates.macro ?? run.macro),
  );

  const needsPause = newEvents.some((e) => e.bucket === "opportunity" || e.bucket === "uncertainty");

  return {
    ...run,
    ...updates,
    status: needsPause ? "paused" : (updates.status ?? run.status),
    events: [...run.events, ...newEvents].slice(-20),
    news: [...news, ...run.news].slice(0, 30),
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
    rounds: [
      ...run.rounds,
      { type: event.payload?.roundType ?? "seed", amount, preMoney, week: run.week },
    ],
    events: run.events.map((e) => (e.id === event.id ? { ...e, resolved: true } : e)),
  };
}

export function acquireTarget(run: GameRun, targetId: string): GameRun {
  const target = run.targets.find((t) => t.id === targetId);
  if (!target || run.cash < target.valuation * 0.3) return run;

  const price = target.valuation * 0.8;
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
      e.payload?.targetId === targetId ? { ...e, resolved: true } : e,
    ),
  };
}