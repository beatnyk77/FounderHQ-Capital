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

  return {
    id: `news-${event.id}`,
    week: event.week,
    headline,
    body: event.description,
    outlet,
    sentiment:
      event.bucket === "threat" ? "negative" : event.bucket === "reward" ? "positive" : "neutral",
  };
}