import { describe, expect, it } from "vitest";
import {
  counterAcceptProbability,
  getFundingStep,
  initFundingStep,
  startFundingCounter,
  submitFundingCounter,
} from "./fundingTheater";
import type { GameEvent, GameRun } from "./types";

function makeEvent(): GameEvent {
  return {
    id: "e1",
    week: 5,
    bucket: "opportunity",
    title: "Term sheet",
    description: "Offer",
    resolved: false,
    expiresAtWeek: 7,
    payload: { amount: 500_000, preMoney: 2_000_000, roundType: "seed" },
  };
}

function makeRun(events: GameEvent[]): GameRun {
  return {
    id: "run-1",
    seed: 1,
    companyName: "Acme",
    industry: "saas",
    regime: "neutral",
    status: "paused",
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
    npcs: [{ id: "vc1", name: "Elena Park", role: "vc", trust: 70 }],
    events,
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
  };
}

describe("initFundingStep", () => {
  it("sets review step on opportunity events", () => {
    const event = initFundingStep(makeEvent());
    expect(getFundingStep(event)).toBe("review");
    expect(event.payload?.originalPreMoney).toBe(2_000_000);
  });
});

describe("startFundingCounter", () => {
  it("moves to counter step", () => {
    const run = makeRun([initFundingStep(makeEvent())]);
    const result = startFundingCounter(run, "e1");
    expect(getFundingStep(result.events[0])).toBe("counter");
  });
});

describe("submitFundingCounter", () => {
  it("moves to resolve with vc response", () => {
    const run = makeRun([
      {
        ...initFundingStep(makeEvent()),
        payload: {
          ...initFundingStep(makeEvent()).payload,
          fundingStep: "counter",
        },
      },
    ]);
    const result = submitFundingCounter(run, "e1", 2_200_000);
    const event = result.events[0];
    expect(getFundingStep(event)).toBe("resolve");
    expect(event.payload?.vcResponse).toMatch(/accepted_counter|rejected_counter/);
  });
});

describe("counterAcceptProbability", () => {
  it("is higher when asking below original valuation", () => {
    const event = initFundingStep(makeEvent());
    const run = makeRun([event]);
    const lower = counterAcceptProbability(run, event, 1_800_000);
    const higher = counterAcceptProbability(run, event, 2_300_000);
    expect(lower).toBeGreaterThan(higher);
  });
});