import { describe, expect, it } from "vitest";
import { defaultTargetFields } from "./rivalEngine";
import { worldPulse } from "./worldPulse";
import type { GameRun } from "./types";

function makeRun(overrides: Partial<GameRun> = {}): GameRun {
  return {
    id: "run-1",
    seed: 7,
    companyName: "Acme",
    industry: "saas",
    regime: "neutral",
    status: "active",
    week: 3,
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
    npcs: [{ id: "r1", name: "Marcus Hale", role: "rival", trust: 40 }],
    events: [],
    news: [],
    targets: [
      defaultTargetFields({
        id: "t1",
        name: "Nexlify",
        industry: "saas",
        valuation: 3_000_000,
        healthScore: 70,
        synergy: 25,
      }),
    ],
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

describe("worldPulse", () => {
  it("increments pulse count", () => {
    const result = worldPulse(makeRun());
    expect(result.pulseCount).toBe(1);
  });

  it("does not pulse when paused", () => {
    const result = worldPulse(makeRun({ status: "paused" }));
    expect(result.pulseCount).toBe(0);
  });

  it("does not pulse during week recap", () => {
    const result = worldPulse(
      makeRun({
        weekRecap: {
          week: 3,
          prevRevenue: 1,
          prevValuation: 1,
          revenueDelta: 0,
          valuationDelta: 0,
          eventsSummary: [],
          resolutions: [],
          cliffhanger: "",
        },
      }),
    );
    expect(result.pulseCount).toBe(0);
  });
});