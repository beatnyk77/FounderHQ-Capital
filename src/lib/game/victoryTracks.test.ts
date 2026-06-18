import { describe, expect, it } from "vitest";
import {
  getCompletedTrackCount,
  getVictoryTracks,
  hasWon,
  VICTORY_REQUIRED,
} from "./victoryTracks";
import type { GameRun, NewsArticle, NPC } from "./types";

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
    tickRemainingMs: 30_000,
    score: 0,
    startedAt: Date.now(),
    investigations: [],
    reputationSwings: [],
    verifiedIntel: [],
    publicNarrative: "",
    pulseCount: 0,
    dealRoom: null,
    archetype: { aggressiveCapital: 0, operator: 0, dealmaker: 0, visionary: 0 },
    archetypeRevealed: false,
    portfolio: [],
    ...overrides,
  };
}

const regulatoryArticle: NewsArticle = {
  id: "news-reg",
  week: 4,
  headline: "Regulators circle sector",
  body: "Probe announced",
  outlet: "Wire",
  sentiment: "negative",
  intelType: "regulatory",
  verifiable: true,
};

const alliedNpcs: NPC[] = [
  { id: "vc-1", name: "Morgan", role: "vc", trust: 60, stance: "ally", memory: [] },
  { id: "riv-1", name: "Kai", role: "rival", trust: 55, stance: "neutral", memory: [] },
  { id: "j-1", name: "Sloane", role: "journalist", trust: 55, stance: "neutral", memory: [] },
];

describe("victoryTracks", () => {
  it("returns zero completed tracks for a fresh run", () => {
    const run = makeRun();
    expect(getCompletedTrackCount(run)).toBe(0);
    expect(hasWon(run)).toBe(false);
    expect(getVictoryTracks(run)).toHaveLength(4);
  });

  it("completes acquire track at 2 acquisitions", () => {
    const run = makeRun({ acquisitions: 2 });
    const track = getVictoryTracks(run).find((t) => t.id === "acquire");
    expect(track?.complete).toBe(true);
  });

  it("completes markets track at 15% share", () => {
    const run = makeRun({ marketShare: 15 });
    const track = getVictoryTracks(run).find((t) => t.id === "markets");
    expect(track?.complete).toBe(true);
  });

  it("completes regulators with trust and verified regulatory intel", () => {
    const run = makeRun({
      reputation: 65,
      news: [regulatoryArticle],
      verifiedIntel: ["news-reg"],
    });
    const track = getVictoryTracks(run).find((t) => t.id === "regulators");
    expect(track?.complete).toBe(true);
  });

  it("completes regulators with trust and high avg NPC trust", () => {
    const run = makeRun({ reputation: 62, npcs: alliedNpcs });
    const track = getVictoryTracks(run).find((t) => t.id === "regulators");
    expect(track?.complete).toBe(true);
  });

  it("completes dominate when all three conditions met", () => {
    const run = makeRun({
      marketShare: 22,
      peakValuation: 7_000_000,
      acquisitions: 1,
    });
    const track = getVictoryTracks(run).find((t) => t.id === "dominate");
    expect(track?.complete).toBe(true);
  });

  it("wins when two tracks complete", () => {
    const run = makeRun({ acquisitions: 2, marketShare: 16 });
    expect(getCompletedTrackCount(run)).toBe(2);
    expect(hasWon(run)).toBe(true);
    expect(VICTORY_REQUIRED).toBe(2);
  });

  it("does not win with only one track", () => {
    const run = makeRun({ acquisitions: 2 });
    expect(getCompletedTrackCount(run)).toBe(1);
    expect(hasWon(run)).toBe(false);
  });

  it("wins with three tracks complete", () => {
    const run = makeRun({
      acquisitions: 2,
      marketShare: 18,
      reputation: 70,
      news: [regulatoryArticle],
      verifiedIntel: ["news-reg"],
    });
    expect(getCompletedTrackCount(run)).toBe(3);
    expect(hasWon(run)).toBe(true);
  });
});