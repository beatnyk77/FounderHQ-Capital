import { describe, expect, it } from "vitest";
import {
  bumpHeatOnScout,
  decayTargetHeat,
  defaultTargetFields,
  heatOddsModifier,
  tickTargetRival,
  walkFromTarget,
} from "./rivalEngine";
import type { AcquisitionTarget, GameRun } from "./types";

function makeTarget(overrides: Partial<AcquisitionTarget> = {}): AcquisitionTarget {
  return defaultTargetFields({
    id: "t1",
    name: "Nexlify",
    industry: "saas",
    valuation: 3_000_000,
    healthScore: 70,
    synergy: 25,
    ...overrides,
  });
}

function makeRun(overrides: Partial<GameRun> = {}): GameRun {
  return {
    id: "run-1",
    seed: 99,
    companyName: "Acme",
    industry: "saas",
    regime: "neutral",
    status: "active",
    week: 4,
    cash: 800_000,
    burn: 45_000,
    revenue: 8_000,
    valuation: 2_000_000,
    productScore: 35,
    morale: 70,
    marketShare: 2,
    employees: 8,
    reputation: 50,
    stage: "seed",
    totalRaised: 0,
    peakValuation: 2_000_000,
    founderOwnership: 100,
    sectorIndex: 100,
    macro: {
      interestRate: 0.05,
      inflation: 0.02,
      gdpGrowth: 0.025,
      creditSpread: 0.025,
      marketSentiment: 0.5,
      regulatoryStance: 0.35,
    },
    npcs: [{ id: "r1", name: "Marcus Hale", role: "rival", trust: 30 }],
    events: [],
    news: [],
    targets: [makeTarget()],
    scoutedTargets: ["t1"],
    rounds: [],
    acquisitions: 0,
    valuationHistory: [2_000_000],
    weekRecap: null,
    operateUsedThisWeek: false,
    nextTickAt: null,
    tickRemainingMs: null,
    score: 0,
    startedAt: Date.now(),
    investigations: [],
    reputationSwings: [],
    verifiedIntel: [],
    publicNarrative: "",
    pulseCount: 0,
    ...overrides,
  };
}

describe("bumpHeatOnScout", () => {
  it("raises heat and rival interest", () => {
    const result = bumpHeatOnScout(makeTarget(), 4);
    expect(result.heatLevel).toBeGreaterThan(20);
    expect(result.rivalInterest).toBeGreaterThan(15);
    expect(result.expiresAtWeek).toBe(8);
  });
});

describe("heatOddsModifier", () => {
  it("penalizes when rival has bid", () => {
    expect(heatOddsModifier(makeTarget({ rivalBid: 2_500_000 }))).toBeLessThan(0);
  });

  it("bonuses high heat without rival bid", () => {
    expect(heatOddsModifier(makeTarget({ heatLevel: 85 }))).toBeGreaterThan(0);
  });
});

describe("walkFromTarget", () => {
  it("removes target and hurts reputation", () => {
    const result = walkFromTarget(makeRun(), "t1");
    expect(result.targets).toHaveLength(0);
    expect(result.reputation).toBeLessThan(50);
    expect(result.reputationSwings[0].delta).toBe(-4);
  });
});

describe("tickTargetRival", () => {
  it("can place rival bid at high heat", () => {
    let bidPlaced = false;
    for (let seed = 0; seed < 500; seed++) {
      const run = makeRun({ seed });
      const target = makeTarget({ heatLevel: 90, rivalInterest: 70 });
      const updated = tickTargetRival(run, target, seed);
      if (updated.rivalBid) {
        bidPlaced = true;
        break;
      }
    }
    expect(bidPlaced).toBe(true);
  });
});

describe("decayTargetHeat", () => {
  it("reduces heat over time", () => {
    const result = decayTargetHeat(makeTarget({ heatLevel: 50, rivalInterest: 40 }));
    expect(result.heatLevel).toBeLessThan(50);
    expect(result.rivalInterest).toBeLessThan(40);
  });
});