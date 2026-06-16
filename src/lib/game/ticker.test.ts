import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  freezeTickTimer,
  getCountdownLabel,
  getMsUntilTick,
  resolveTickSchedule,
} from "./ticker";

describe("formatCountdown", () => {
  it("formats minutes and seconds with zero padding", () => {
    expect(formatCountdown(150_000)).toBe("2:30");
    expect(formatCountdown(65_000)).toBe("1:05");
    expect(formatCountdown(4_200)).toBe("0:05");
  });

  it("never shows negative time", () => {
    expect(formatCountdown(-1_000)).toBe("0:00");
  });
});

describe("getMsUntilTick", () => {
  it("returns remaining ms until deadline", () => {
    expect(getMsUntilTick(10_000, 4_000)).toBe(6_000);
  });

  it("returns 0 when deadline passed", () => {
    expect(getMsUntilTick(5_000, 8_000)).toBe(0);
  });

  it("returns null when no deadline", () => {
    expect(getMsUntilTick(null, 8_000)).toBe(null);
  });
});

describe("resolveTickSchedule", () => {
  const weekMs = 150_000;

  it("uses saved remaining time after pause", () => {
    const result = resolveTickSchedule({ nextTickAt: null, tickRemainingMs: 42_000 }, 1_000, weekMs);
    expect(result).toEqual({ delayMs: 42_000, nextTickAt: 43_000, tickRemainingMs: null });
  });

  it("reuses future deadline across refresh", () => {
    const result = resolveTickSchedule({ nextTickAt: 200_000, tickRemainingMs: null }, 100_000, weekMs);
    expect(result).toEqual({ delayMs: 100_000, nextTickAt: 200_000, tickRemainingMs: null });
  });

  it("starts a fresh week when no deadline exists", () => {
    const result = resolveTickSchedule({ nextTickAt: null, tickRemainingMs: null }, 50_000, weekMs);
    expect(result).toEqual({ delayMs: weekMs, nextTickAt: 200_000, tickRemainingMs: null });
  });
});

describe("freezeTickTimer", () => {
  it("stores remaining time and clears deadline when pausing", () => {
    expect(freezeTickTimer({ nextTickAt: 90_000, tickRemainingMs: null }, 60_000)).toEqual({
      nextTickAt: null,
      tickRemainingMs: 30_000,
    });
  });

  it("leaves state unchanged when clock was not running", () => {
    const state = { nextTickAt: null, tickRemainingMs: 12_000 };
    expect(freezeTickTimer(state, 60_000)).toEqual(state);
  });
});

describe("getCountdownLabel", () => {
  it("shows paused label when game is paused or in recap", () => {
    expect(getCountdownLabel(30_000, "paused", false)).toBe("PAUSED");
    expect(getCountdownLabel(30_000, "active", true)).toBe("PAUSED");
  });

  it("shows formatted countdown when clock is live", () => {
    expect(getCountdownLabel(90_000, "active", false)).toBe("1:30");
  });
});