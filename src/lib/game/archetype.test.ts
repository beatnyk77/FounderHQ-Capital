import { describe, expect, it } from "vitest";
import {
  getArchetypeTitle,
  recordArchetypeSignal,
} from "./archetype";
import { EMPTY_ARCHETYPE } from "./types";

describe("recordArchetypeSignal", () => {
  it("accumulates dimension scores", () => {
    const run = {
      archetype: { ...EMPTY_ARCHETYPE },
      week: 3,
      archetypeRevealed: false,
    } as Parameters<typeof recordArchetypeSignal>[0];

    const result = recordArchetypeSignal(
      recordArchetypeSignal(run, "dealmaker", 2),
      "dealmaker",
      3,
    );
    expect(result.archetype.dealmaker).toBe(5);
  });

  it("reveals archetype at week 8", () => {
    const run = {
      archetype: { ...EMPTY_ARCHETYPE },
      week: 8,
      archetypeRevealed: false,
    } as Parameters<typeof recordArchetypeSignal>[0];

    expect(recordArchetypeSignal(run, "operator", 1).archetypeRevealed).toBe(true);
  });
});

describe("getArchetypeTitle", () => {
  it("returns compound title for strong signals", () => {
    const title = getArchetypeTitle({
      aggressiveCapital: 5,
      operator: 2,
      dealmaker: 4,
      visionary: 1,
    });
    expect(title).toContain("Aggressive");
  });
});