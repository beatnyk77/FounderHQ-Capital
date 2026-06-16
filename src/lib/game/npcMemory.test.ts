import { describe, expect, it } from "vitest";
import { computeStance, recordNpcMemory, stanceLabel } from "./npcMemory";
import type { GameRun, NPC } from "./types";

function makeNpc(overrides: Partial<NPC> = {}): NPC {
  return {
    id: "vc-1",
    name: "Elena",
    role: "vc",
    trust: 50,
    stance: "neutral",
    memory: [],
    ...overrides,
  };
}

function makeRun(npcs: NPC[]): GameRun {
  return { week: 4, npcs } as GameRun;
}

describe("recordNpcMemory", () => {
  it("appends memory and updates stance", () => {
    const run = makeRun([makeNpc()]);
    const result = recordNpcMemory(run, "vc", "Funding", "positive", "Closed round together");
    expect(result.npcs[0].memory).toHaveLength(1);
    expect(result.npcs[0].memory[0].narrative).toContain("Closed round");
  });
});

describe("computeStance", () => {
  it("returns ally after positive memories", () => {
    const npc = makeNpc({
      trust: 70,
      memory: [
        { week: 3, action: "a", sentiment: "positive", narrative: "x" },
        { week: 4, action: "b", sentiment: "positive", narrative: "y" },
      ],
    });
    expect(computeStance(npc)).toBe("ally");
  });

  it("returns hostile after negative memories", () => {
    const npc = makeNpc({
      trust: 25,
      memory: [
        { week: 3, action: "a", sentiment: "negative", narrative: "x" },
        { week: 4, action: "b", sentiment: "negative", narrative: "y" },
      ],
    });
    expect(computeStance(npc)).toBe("hostile");
  });
});

describe("stanceLabel", () => {
  it("maps stance to label", () => {
    expect(stanceLabel("ally")).toBe("Ally");
    expect(stanceLabel("hostile")).toBe("Hostile");
  });
});