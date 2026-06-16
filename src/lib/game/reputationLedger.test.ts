import { describe, expect, it } from "vitest";
import { buildPublicNarrative, recordReputationSwing, reputationTierOddsModifier } from "./reputationLedger";
import type { GameRun } from "./types";

function makeRun(overrides: Partial<GameRun> = {}): GameRun {
  return {
    id: "run-1",
    seed: 1,
    companyName: "Acme Labs",
    industry: "saas",
    regime: "neutral",
    status: "active",
    week: 5,
    cash: 500_000,
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
    npcs: [],
    events: [],
    news: [],
    targets: [],
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
    investigations: [],
    reputationSwings: [],
    verifiedIntel: [],
    publicNarrative: "",
    pulseCount: 0,
    ...overrides,
  };
}

describe("recordReputationSwing", () => {
  it("updates reputation and logs swing", () => {
    const result = recordReputationSwing(makeRun(), -5, "VC", "Deal collapsed");
    expect(result.reputation).toBe(45);
    expect(result.reputationSwings[0]).toMatchObject({
      delta: -5,
      source: "VC",
      narrative: "Deal collapsed",
    });
    expect(result.publicNarrative.length).toBeGreaterThan(0);
  });

  it("clamps reputation between 0 and 100", () => {
    expect(recordReputationSwing(makeRun({ reputation: 98 }), 5, "Win", "Big win").reputation).toBe(100);
    expect(recordReputationSwing(makeRun({ reputation: 2 }), -5, "Loss", "Bad press").reputation).toBe(0);
  });
});

describe("buildPublicNarrative", () => {
  it("reflects acquisition-heavy playstyle", () => {
    const narrative = buildPublicNarrative(makeRun({ acquisitions: 3, reputation: 65 }));
    expect(narrative).toContain("roll-up");
  });
});

describe("reputationTierOddsModifier", () => {
  it("rewards high reputation and penalizes low", () => {
    expect(reputationTierOddsModifier(85)).toBeGreaterThan(0);
    expect(reputationTierOddsModifier(25)).toBeLessThan(0);
  });
});