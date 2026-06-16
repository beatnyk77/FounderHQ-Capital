import type { RunStatus } from "./types";

export interface TickState {
  nextTickAt: number | null;
  tickRemainingMs: number | null;
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function getMsUntilTick(nextTickAt: number | null, now: number): number | null {
  if (nextTickAt == null) return null;
  return Math.max(0, nextTickAt - now);
}

export function resolveTickSchedule(
  state: TickState,
  now: number,
  weekMs: number,
): TickState & { delayMs: number } {
  if (state.tickRemainingMs != null) {
    const delayMs = state.tickRemainingMs;
    return { delayMs, nextTickAt: now + delayMs, tickRemainingMs: null };
  }
  if (state.nextTickAt != null && state.nextTickAt > now) {
    return { delayMs: state.nextTickAt - now, nextTickAt: state.nextTickAt, tickRemainingMs: null };
  }
  return { delayMs: weekMs, nextTickAt: now + weekMs, tickRemainingMs: null };
}

export function freezeTickTimer(state: TickState, now: number): TickState {
  if (state.nextTickAt == null) return state;
  return { nextTickAt: null, tickRemainingMs: Math.max(0, state.nextTickAt - now) };
}

export function getCountdownLabel(ms: number | null, status: RunStatus, hasRecap: boolean): string {
  if (status === "paused" || hasRecap) return "PAUSED";
  if (ms == null) return "--:--";
  return formatCountdown(ms);
}