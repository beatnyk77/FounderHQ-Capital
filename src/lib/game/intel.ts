import { seededRandom } from "./rng";
import type { ActionType, GameRun, NewsArticle, OddsModifier, VerifiedOutcome } from "./types";

export const INVESTIGATE_COST = 15_000;

export function canInvestigate(run: GameRun, article: NewsArticle): boolean {
  if (!article.verifiable) return false;
  if (article.verifiedOutcome) return false;
  if (run.investigations.some((i) => i.articleId === article.id)) return false;
  return run.cash >= (article.verificationCost ?? INVESTIGATE_COST);
}

function journalistAccuracy(run: GameRun): number {
  const journalist = run.npcs.find((n) => n.role === "journalist");
  const base = 0.55;
  const trustBonus = ((journalist?.trust ?? 50) - 50) * 0.003;
  const scoutBonus = run.scoutedTargets.length > 0 ? 0.05 : 0;
  return Math.min(0.85, base + trustBonus + scoutBonus);
}

function resolveOutcome(run: GameRun, article: NewsArticle): VerifiedOutcome {
  const roll = seededRandom(run.seed, run.week, `intel-${article.id}`);
  const accuracy = journalistAccuracy(run);

  if (roll < accuracy * 0.15) return "false_flag";
  if (roll < accuracy) {
    return article.truthState === "false_flag" ? "false_flag" : "confirmed";
  }
  return "conflicting";
}

export function investigateArticle(run: GameRun, articleId: string): GameRun {
  const article = run.news.find((n) => n.id === articleId);
  if (!article || !canInvestigate(run, article)) return run;

  const cost = article.verificationCost ?? INVESTIGATE_COST;
  const outcome = resolveOutcome(run, article);

  const updatedNews = run.news.map((n) => {
    if (n.id !== articleId) return n;
    return {
      ...n,
      verifiedOutcome: outcome,
      truthState: outcome === "confirmed" ? ("confirmed" as const) : outcome,
    };
  });

  let verifiedIntel = [...run.verifiedIntel];
  if (outcome === "confirmed" && article.intelModifier) {
    verifiedIntel = [...verifiedIntel, articleId];
  }

  return {
    ...run,
    cash: run.cash - cost,
    news: updatedNews,
    verifiedIntel,
    investigations: [
      { articleId, week: run.week, outcome, cost },
      ...run.investigations,
    ],
  };
}

export function getIntelModifiers(run: GameRun, action: ActionType): OddsModifier[] {
  const modifiers: OddsModifier[] = [];

  for (const articleId of run.verifiedIntel) {
    const article = run.news.find((n) => n.id === articleId);
    if (!article?.intelModifier || article.intelModifier.action !== action) continue;
    modifiers.push({
      label: article.intelModifier.label,
      value: article.intelModifier.value,
    });
  }

  return modifiers;
}

export function getInvestigableArticles(run: GameRun): NewsArticle[] {
  return run.news.filter(
    (a) => a.verifiable && !a.verifiedOutcome && !run.investigations.some((i) => i.articleId === a.id),
  );
}