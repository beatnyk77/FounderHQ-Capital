import type { GameEvent, GameRun } from "./types";

export function getPendingEvents(run: GameRun): GameEvent[] {
  return run.events.filter((e) => !e.resolved && e.week <= run.week);
}

export function getUrgentPendingEvents(run: GameRun): GameEvent[] {
  return getPendingEvents(run).filter((e) => e.expiresAtWeek - run.week <= 1);
}

export function needsDecisionAttention(run: GameRun): boolean {
  return run.status === "paused" && getPendingEvents(run).length > 0;
}

export interface DecisionAlert {
  count: number;
  urgentCount: number;
  message: string;
  hasActionable: boolean;
}

export function buildDecisionAlert(run: GameRun): DecisionAlert | null {
  const pending = getPendingEvents(run);
  if (pending.length === 0 || run.status !== "paused") return null;

  const urgent = getUrgentPendingEvents(run);
  const urgentNote =
    urgent.length > 0
      ? ` ${urgent.length} expire${urgent.length === 1 ? "s" : ""} this week.`
      : "";

  return {
    count: pending.length,
    urgentCount: urgent.length,
    message: `${pending.length} decision${pending.length === 1 ? "" : "s"} need attention — clock paused.${urgentNote}`,
    hasActionable: pending.some((e) => e.bucket === "opportunity" || e.bucket === "uncertainty"),
  };
}

export function buildTabTitle(run: GameRun): string {
  if (run.weekRecap) {
    return `Week ${run.weekRecap.week} recap · ${run.companyName}`;
  }

  const pending = getPendingEvents(run);
  if (run.status === "paused" && pending.length > 0) {
    return `⏸ ${pending.length} decision${pending.length === 1 ? "" : "s"} · ${run.companyName}`;
  }

  if (run.status === "paused") {
    return `⏸ Paused · ${run.companyName}`;
  }

  if (run.status === "bankrupt") {
    return `Bankrupt · ${run.companyName}`;
  }

  return `${run.companyName} · FounderHQ`;
}