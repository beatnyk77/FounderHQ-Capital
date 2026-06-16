import { describe, expect, it } from "vitest";
import { buildMaPreviews, buildTermSheetPreviews } from "./previewEngine";
import type { AcquisitionTarget, GameEvent, GameRun } from "./types";

function makeRun(overrides: Partial<GameRun> = {}): GameRun {
  return {
    id: "run-1",
    seed: 1,
    companyName: "Acme",
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
    npcs: [{ id: "vc1", name: "Elena Park", role: "vc", trust: 55 }],
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

describe("buildTermSheetPreviews", () => {
  it("includes accept and walk branches", () => {
    const event: GameEvent = {
      id: "e1",
      week: 5,
      bucket: "opportunity",
      title: "Term sheet",
      description: "Offer",
      resolved: false,
      expiresAtWeek: 7,
      payload: { amount: 500_000, preMoney: 2_000_000 },
    };
    const previews = buildTermSheetPreviews(makeRun(), event);
    expect(previews.map((p) => p.action)).toEqual(["Accept", "Walk"]);
    expect(previews[0].lines.some((l) => l.label.includes("Cash"))).toBe(true);
  });
});

describe("buildMaPreviews", () => {
  it("surfaces acquire consequences", () => {
    const target: AcquisitionTarget = {
      id: "t1",
      name: "Nexlify",
      industry: "saas",
      valuation: 3_000_000,
      healthScore: 70,
      synergy: 25,
      heatLevel: 0,
      rivalInterest: 0,
    };
    const previews = buildMaPreviews(makeRun(), target);
    expect(previews[0].action).toBe("Acquire");
    expect(previews[0].lines.length).toBeGreaterThan(2);
  });
});