import { describe, expect, it } from "vitest";
import { defaultTargetFields } from "./rivalEngine";
import { openDealRoom, runDiligence, selectDealStructure } from "./dealRoom";
import { EMPTY_ARCHETYPE } from "./types";
import type { GameRun } from "./types";

function makeRun(): GameRun {
  return {
    id: "run-1",
    seed: 42,
    companyName: "Acme",
    industry: "saas",
    regime: "neutral",
    status: "active",
    week: 6,
    cash: 200_000,
    burn: 45_000,
    revenue: 8_000,
    valuation: 2_000_000,
    productScore: 35,
    morale: 70,
    marketShare: 2,
    employees: 8,
    reputation: 50,
    stage: "series_a",
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
    npcs: [
      { id: "vc-1", name: "VC", role: "vc", trust: 50, stance: "neutral", memory: [] },
      { id: "r-1", name: "Rival", role: "rival", trust: 30, stance: "neutral", memory: [] },
      { id: "j-1", name: "Press", role: "journalist", trust: 50, stance: "neutral", memory: [] },
    ],
    events: [],
    news: [],
    targets: [
      defaultTargetFields({
        id: "t1",
        name: "Nexlify",
        industry: "saas",
        valuation: 2_000_000,
        healthScore: 70,
        synergy: 20,
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
    dealRoom: null,
    archetype: { ...EMPTY_ARCHETYPE },
    archetypeRevealed: false,
    portfolio: [],
  };
}

describe("openDealRoom", () => {
  it("opens deal room at screen phase", () => {
    const result = openDealRoom(makeRun(), "t1");
    expect(result.dealRoom?.phase).toBe("screen");
    expect(result.dealRoom?.targetId).toBe("t1");
  });
});

describe("runDiligence", () => {
  it("advances to structure and deducts cost", () => {
    const opened = openDealRoom(makeRun(), "t1");
    const result = runDiligence(opened, "standard");
    expect(result.cash).toBe(165_000);
    expect(result.dealRoom?.phase).toBe("structure");
    expect(result.dealRoom?.revealedIntel.length).toBe(2);
  });
});

describe("selectDealStructure", () => {
  it("moves to close phase", () => {
    let run = openDealRoom(makeRun(), "t1");
    run = runDiligence(run, "quick");
    run = selectDealStructure(run, "cash");
    expect(run.dealRoom?.phase).toBe("close");
    expect(run.dealRoom?.structure).toBe("cash");
  });
});