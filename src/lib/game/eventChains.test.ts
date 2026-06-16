import { describe, expect, it } from "vitest";
import { maybeSpawnChain } from "./eventChains";
import type { GameEvent, GameRun } from "./types";

function makeRun(seed: number): GameRun {
  return {
    seed,
    week: 5,
    status: "active",
    events: [],
  } as GameRun;
}

function makeEvent(): GameEvent {
  return {
    id: "parent-1",
    week: 5,
    bucket: "opportunity",
    title: "Term sheet",
    description: "",
    resolved: true,
    expiresAtWeek: 7,
    chainDepth: 0,
  };
}

describe("maybeSpawnChain", () => {
  it("spawns follow-up event on funding failure", () => {
    let spawned = false;
    for (let seed = 0; seed < 200; seed++) {
      const result = maybeSpawnChain(makeRun(seed), makeEvent(), "term_sheet", false);
      if (result.events.length > 0) {
        spawned = true;
        expect(result.events[0].parentEventId).toBe("parent-1");
        expect(result.events[0].chainDepth).toBe(1);
        break;
      }
    }
    expect(spawned).toBe(true);
  });

  it("does not chain beyond depth 2", () => {
    const parent = { ...makeEvent(), chainDepth: 2 };
    const result = maybeSpawnChain(makeRun(1), parent, "term_sheet", false);
    expect(result.events).toHaveLength(0);
  });
});