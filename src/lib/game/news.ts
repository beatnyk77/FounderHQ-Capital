import { pickOutlet } from "./npcs";
import { seededRandom } from "./rng";
import type { GameEvent, GameRun, MacroState, NewsArticle } from "./types";

const HEADLINES: Record<string, string[]> = {
  opportunity: [
    "{vc} leads term sheet talks for {company} amid {industry} surge",
    "{outlet}: {company} catches investor attention in hot {industry} market",
    "Sources: {vc} circling {company} with board seat demand",
  ],
  threat: [
    "{outlet}: Regulators scrutinize {industry} — {company} on watchlist",
    "{rival} raises war chest; market share pressure on {company}",
    "Macro headwinds: rates at {rate}% squeeze {company} runway",
  ],
  reward: [
    "{outlet}: {company} closes enterprise deal — morale surges",
    "{journalist}: Product launch drives {company} NPS to record highs",
    "Press lauds {company} as {industry} darling",
  ],
  uncertainty: [
    "{journalist}: Analysts split on {company} valuation amid choppy markets",
    "{rival} rumored to bid on same target as {company} — unconfirmed",
    "{outlet}: Industry cycle shift leaves {company} path unclear",
  ],
};

function pick<T>(arr: T[], seed: number, week: number, salt: string): T {
  return arr[Math.floor(seededRandom(seed, week, salt) * arr.length)];
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? k));
}

export function generateNews(
  event: GameEvent,
  companyName: string,
  industry: string,
  macro: MacroState,
  run: GameRun,
): NewsArticle {
  const vc = run.npcs.find((n) => n.role === "vc");
  const rival = run.npcs.find((n) => n.role === "rival");
  const journalist = run.npcs.find((n) => n.role === "journalist");
  const outlet = pickOutlet(run.seed, event.week);

  const templates = HEADLINES[event.bucket];
  const headline = fill(pick(templates, run.seed, event.week, event.bucket), {
    company: companyName,
    industry,
    rate: (macro.interestRate * 100).toFixed(1),
    vc: vc?.name ?? "Lead VC",
    rival: rival?.name ?? "Rival CEO",
    journalist: journalist?.name ?? "Reporter",
    outlet,
  });

  const base: NewsArticle = {
    id: `news-${event.id}`,
    week: event.week,
    headline,
    body: event.description,
    outlet,
    sentiment:
      event.bucket === "threat" ? "negative" : event.bucket === "reward" ? "positive" : "neutral",
    relatedEventId: event.id,
  };

  if (event.bucket === "uncertainty" && event.payload?.targetId) {
    const isReal = seededRandom(run.seed, event.week, `intel-truth-${event.id}`) > 0.2;
    return {
      ...base,
      intelType: "competitive",
      verifiable: true,
      verificationCost: 15_000,
      truthState: isReal ? "confirmed" : "false_flag",
      relatedTargetId: event.payload.targetId,
      intelModifier: isReal
        ? { action: "ma_close", value: 0.08, label: "Verified rumor" }
        : undefined,
    };
  }

  if (event.bucket === "threat") {
    return {
      ...base,
      intelType: "regulatory",
      verifiable: true,
      verificationCost: 15_000,
      truthState: "confirmed",
      intelModifier: { action: "threat_mitigate", value: 0.06, label: "Verified threat" },
    };
  }

  if (event.bucket === "opportunity") {
    const strongOffer = (event.payload?.amount ?? 0) > run.valuation * 0.2;
    if (strongOffer) {
      return {
        ...base,
        intelType: "market",
        verifiable: true,
        verificationCost: 15_000,
        truthState: "confirmed",
        intelModifier: { action: "term_sheet", value: 0.05, label: "Verified terms" },
      };
    }
  }

  return base;
}