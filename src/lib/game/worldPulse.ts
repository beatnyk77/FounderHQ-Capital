import { pickOutlet } from "./npcs";
import { buildRivalBidHeadline, tickAllRivalMoves } from "./rivalEngine";
import { seededRandom } from "./rng";
import type { GameRun, NewsArticle } from "./types";

const AMBIENT_TEMPLATES = [
  "{rival} seen taking meetings in {industry} — intent unclear",
  "Sector chatter: multiples shifting on macro data",
  "{outlet} flash: {industry} deal volume ticks higher",
  "Analyst note: competitive intensity rising in {industry}",
];

function maybeAmbientHeadline(run: GameRun, pulseIndex: number): NewsArticle | null {
  const roll = seededRandom(run.seed, run.week, `ambient-${pulseIndex}`);
  if (roll > 0.1) return null;

  const rival = run.npcs.find((n) => n.role === "rival");
  const outlet = pickOutlet(run.seed, pulseIndex);
  const template = AMBIENT_TEMPLATES[Math.floor(roll * 10 * AMBIENT_TEMPLATES.length) % AMBIENT_TEMPLATES.length];

  const headline = template
    .replace("{rival}", rival?.name ?? "Rival CEO")
    .replace("{industry}", run.industry)
    .replace("{outlet}", outlet);

  return {
    id: `ambient-${run.week}-${pulseIndex}`,
    week: run.week,
    headline,
    body: "Ambient market signal — no immediate action required.",
    outlet,
    sentiment: "neutral",
  };
}

export function worldPulse(run: GameRun): GameRun {
  if (run.status !== "active" || run.weekRecap) return run;

  const pulseIndex = run.pulseCount + 1;
  let updated = tickAllRivalMoves(run, pulseIndex);
  updated = { ...updated, pulseCount: pulseIndex };

  const headlines: NewsArticle[] = [];

  const ambient = maybeAmbientHeadline(updated, pulseIndex);
  if (ambient) headlines.push(ambient);

  for (const target of updated.targets) {
    const rivalNews = buildRivalBidHeadline(updated, target);
    if (rivalNews && !updated.news.some((n) => n.id === rivalNews.id)) {
      headlines.push(rivalNews);
    }
  }

  if (headlines.length === 0) return updated;

  return {
    ...updated,
    news: [...headlines, ...updated.news].slice(0, 30),
  };
}