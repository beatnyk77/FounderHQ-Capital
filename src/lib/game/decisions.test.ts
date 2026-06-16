import { describe, expect, it } from "vitest";
import {
  buildDecisionAlert,
  buildTabTitle,
  getPendingEvents,
  getUrgentPendingEvents,
  needsDecisionAttention,
} from "./decisions";
import type { GameEvent, GameRun } from "./types";

function makeEvent(overrides: Partial<GameEvent> = {}): GameEvent {
  return {
    id: "evt-1",
    week: 5,
    bucket: "opportunity",
    title: "Term sheet",
    description: "Offer incoming",
    resolved: false,
    expiresAtWeek: 7,
    ...overrides,
  };
}

function makeRun(overrides: Partial<GameRun> = {}): GameRun {
  return {
    id: "run-1",
    seed: 1,
    companyName: "Acme Labs",
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
    tickRemainingMs: 30_000,
    score: 0,
    startedAt: Date.now(),
    investigations: [],
    reputationSwings: [],
    verifiedIntel: [],
    publicNarrative: "",
    ...overrides,
  };
}

describe("getPendingEvents", () => {
  it("returns unresolved events from current or prior weeks", () => {
    const run = makeRun({
      events: [
        makeEvent({ id: "a", resolved: false }),
        makeEvent({ id: "b", resolved: true }),
        makeEvent({ id: "c", week: 6, resolved: false }),
      ],
    });
    expect(getPendingEvents(run).map((e) => e.id)).toEqual(["a"]);
  });
});

describe("getUrgentPendingEvents", () => {
  it("returns events expiring within one week", () => {
    const run = makeRun({
      events: [
        makeEvent({ id: "soon", expiresAtWeek: 5 }),
        makeEvent({ id: "later", expiresAtWeek: 8 }),
      ],
    });
    // fix duplicate id typo
    run.events[1].id = "later";
    expect(getUrgentPendingEvents(run).map((e) => e.id)).toEqual(["soon"]);
  });
});

describe("needsDecisionAttention", () => {
  it("is true when paused with pending events", () => {
    expect(needsDecisionAttention(makeRun({ events: [makeEvent()] }))).toBe(true);
  });

  it("is false when clock is active", () => {
    expect(
      needsDecisionAttention(makeRun({ status: "active", events: [makeEvent()] })),
    ).toBe(false);
  });
});

describe("buildDecisionAlert", () => {
  it("summarizes pending and urgent counts", () => {
    const alert = buildDecisionAlert(
      makeRun({
        events: [
          makeEvent({ id: "a", expiresAtWeek: 5 }),
          makeEvent({ id: "b", bucket: "uncertainty", expiresAtWeek: 7 }),
        ],
      }),
    );
    expect(alert).toEqual({
      count: 2,
      urgentCount: 1,
      message: "2 decisions need attention — clock paused. 1 expires this week.",
      hasActionable: true,
    });
  });

  it("returns null when nothing is pending", () => {
    expect(buildDecisionAlert(makeRun())).toBeNull();
  });
});

describe("buildTabTitle", () => {
  it("prioritizes week recap in the tab title", () => {
    expect(
      buildTabTitle(
        makeRun({
          weekRecap: {
            week: 4,
            prevRevenue: 1,
            prevValuation: 1,
            revenueDelta: 0,
            valuationDelta: 0,
            eventsSummary: [],
            resolutions: [],
            cliffhanger: "",
          },
        }),
      ),
    ).toBe("Week 4 recap · Acme Labs");
  });

  it("shows pending decision count when paused", () => {
    expect(buildTabTitle(makeRun({ events: [makeEvent(), makeEvent({ id: "evt-2" })] }))).toBe(
      "⏸ 2 decisions · Acme Labs",
    );
  });

  it("shows live company name when clock is running", () => {
    expect(buildTabTitle(makeRun({ status: "active" }))).toBe("Acme Labs · FounderHQ");
  });
});