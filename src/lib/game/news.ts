import type { GameEvent, MacroState, NewsArticle } from "./types";

const HEADLINES: Record<string, string[]> = {
  opportunity: [
    "{company} catches investor attention amid {industry} surge",
    "Strategic partner eyes collaboration with {company}",
    "Talent exodus at rival opens hiring window for {company}",
  ],
  threat: [
    "Regulators scrutinize {industry} sector — {company} on watchlist",
    "Competitor raises war chest; market share pressure on {company}",
    "Macro headwinds: rates at {rate}% squeeze startup runway",
  ],
  reward: [
    "{company} hits revenue milestone — morale surges",
    "Product launch drives {company} NPS to record highs",
    "Press lauds {company} as {industry} darling",
  ],
  uncertainty: [
    "Analysts split on {company} valuation amid choppy markets",
    "Whispers of acquisition interest in {company} — unconfirmed",
    "Industry cycle shift leaves {company} path unclear",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? k));
}

export function generateNews(
  event: GameEvent,
  companyName: string,
  industry: string,
  macro: MacroState,
): NewsArticle {
  const templates = HEADLINES[event.bucket];
  const headline = fill(pick(templates), {
    company: companyName,
    industry,
    rate: (macro.interestRate * 100).toFixed(1),
  });

  return {
    id: `news-${event.id}`,
    week: event.week,
    headline,
    body: event.description,
    sentiment:
      event.bucket === "threat" ? "negative" : event.bucket === "reward" ? "positive" : "neutral",
  };
}