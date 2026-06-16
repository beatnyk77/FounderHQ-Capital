import { describe, expect, it } from "vitest";
import { canInvestigate, getIntelModifiers, investigateArticle } from "./intel";
import type { GameRun, NewsArticle } from "./types";

function makeArticle(overrides: Partial<NewsArticle> = {}): NewsArticle {
  return {
    id: "news-1",
    week: 3,
    headline: "Rival circling target",
    body: "Unconfirmed",
    outlet: "Bloomberg",
    sentiment: "neutral",
    verifiable: true,
    verificationCost: 15_000,
    truthState: "confirmed",
    intelModifier: { action: "ma_close", value: 0.08, label: "Verified rumor" },
    ...overrides,
  };
}

function makeRun(overrides: Partial<GameRun> = {}): GameRun {
  return {
    id: "run-1",
    seed: 42,
    companyName: "Acme",
    industry: "saas",
    regime: "neutral",
    status: "active",
    week: 3,
    cash: 100_000,
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
    npcs: [{ id: "j1", name: "Reporter", role: "journalist", trust: 70 }],
    events: [],
    news: [makeArticle()],
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
    ...overrides,
  };
}

describe("canInvestigate", () => {
  it("returns false when already investigated", () => {
    const run = makeRun({
      investigations: [{ articleId: "news-1", week: 3, outcome: "confirmed", cost: 15_000 }],
    });
    expect(canInvestigate(run, makeArticle())).toBe(false);
  });

  it("returns false when cash is insufficient", () => {
    expect(canInvestigate(makeRun({ cash: 5_000 }), makeArticle())).toBe(false);
  });

  it("returns true for verifiable unverified article with cash", () => {
    expect(canInvestigate(makeRun(), makeArticle())).toBe(true);
  });
});

describe("investigateArticle", () => {
  it("deducts cost and records investigation", () => {
    const result = investigateArticle(makeRun(), "news-1");
    expect(result.cash).toBe(85_000);
    expect(result.investigations).toHaveLength(1);
    expect(result.investigations[0].articleId).toBe("news-1");
    expect(result.news[0].verifiedOutcome).toBeDefined();
  });

  it("adds verified intel modifier when confirmed", () => {
    const run = makeRun({ seed: 999 });
    let confirmed = false;
    for (let seed = 0; seed < 200; seed++) {
      const attempt = investigateArticle(makeRun({ seed }), "news-1");
      if (attempt.verifiedIntel.includes("news-1")) {
        confirmed = true;
        const mods = getIntelModifiers(attempt, "ma_close");
        expect(mods.some((m) => m.label === "Verified rumor")).toBe(true);
        break;
      }
    }
    expect(confirmed).toBe(true);
  });
});