import { seededRandom } from "./rng";
import type { GameEvent, GameRun } from "./types";

export function initFundingStep(event: GameEvent): GameEvent {
  if (event.bucket !== "opportunity") return event;
  return {
    ...event,
    payload: {
      ...event.payload,
      fundingStep: "review",
      originalPreMoney: event.payload?.preMoney,
      boardSeat: true,
      vcResponse: "pending",
    },
  };
}

export function startFundingCounter(run: GameRun, eventId: string): GameRun {
  return {
    ...run,
    events: run.events.map((e) =>
      e.id === eventId && e.bucket === "opportunity"
        ? { ...e, payload: { ...e.payload, fundingStep: "counter" as const } }
        : e,
    ),
  };
}

export function counterAcceptProbability(
  run: GameRun,
  event: GameEvent,
  counterPreMoney: number,
): number {
  const original = event.payload?.originalPreMoney ?? event.payload?.preMoney ?? run.valuation;
  const vc = run.npcs.find((n) => n.role === "vc");
  const trustBonus = ((vc?.trust ?? 50) - 50) * 0.004;
  const valuationDelta = (counterPreMoney - original) / original;
  const askPenalty = valuationDelta > 0 ? valuationDelta * -0.8 : Math.abs(valuationDelta) * 0.3;
  return Math.min(0.85, Math.max(0.15, 0.48 + trustBonus + askPenalty));
}

export function submitFundingCounter(
  run: GameRun,
  eventId: string,
  counterPreMoney: number,
): GameRun {
  const event = run.events.find((e) => e.id === eventId);
  if (!event?.payload) return run;

  const prob = counterAcceptProbability(run, event, counterPreMoney);
  const roll = seededRandom(run.seed, run.week, `counter-${eventId}`);
  const accepted = roll < prob;

  return {
    ...run,
    events: run.events.map((e) => {
      if (e.id !== eventId) return e;
      return {
        ...e,
        payload: {
          ...e.payload,
          fundingStep: "resolve" as const,
          counterPreMoney,
          preMoney: accepted ? counterPreMoney : e.payload?.originalPreMoney ?? e.payload?.preMoney,
          vcResponse: accepted ? ("accepted_counter" as const) : ("rejected_counter" as const),
        },
        description: accepted
          ? `VC accepted your counter at $${(counterPreMoney / 1e6).toFixed(1)}M pre-money. Board seat still on table.`
          : `VC rejected $${(counterPreMoney / 1e6).toFixed(1)}M pre — original terms stand.`,
      };
    }),
  };
}

export function getFundingStep(event: GameEvent): "review" | "counter" | "resolve" {
  return event.payload?.fundingStep ?? "review";
}

export function getEffectivePreMoney(event: GameEvent): number {
  if (event.payload?.vcResponse === "accepted_counter" && event.payload.counterPreMoney) {
    return event.payload.counterPreMoney;
  }
  return event.payload?.preMoney ?? 0;
}