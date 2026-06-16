import type { ArchetypeDimension, ArchetypeVector, GameRun } from "./types";
import { EMPTY_ARCHETYPE } from "./types";

const REVEAL_WEEK = 8;

export function recordArchetypeSignal(
  run: GameRun,
  dimension: ArchetypeDimension,
  amount: number,
): GameRun {
  const archetype = { ...run.archetype, [dimension]: run.archetype[dimension] + amount };
  const archetypeRevealed = run.archetypeRevealed || run.week >= REVEAL_WEEK;
  return { ...run, archetype, archetypeRevealed };
}

export function getTopArchetypeDimensions(archetype: ArchetypeVector): [ArchetypeDimension, ArchetypeDimension] {
  const sorted = (Object.entries(archetype) as [ArchetypeDimension, number][])
    .sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

const DIMENSION_LABELS: Record<ArchetypeDimension, string> = {
  aggressiveCapital: "Aggressive",
  operator: "Operator",
  dealmaker: "Dealmaker",
  visionary: "Visionary",
};

export function getArchetypeTitle(archetype: ArchetypeVector): string {
  const [first, second] = getTopArchetypeDimensions(archetype);
  if (archetype[first] < 2) return "Emerging Founder";
  return `The ${DIMENSION_LABELS[first]} ${DIMENSION_LABELS[second]}`;
}

export function getArchetypeSignals(archetype: ArchetypeVector): string[] {
  const signals: string[] = [];
  if (archetype.aggressiveCapital >= 2) signals.push("VCs see you as a tough negotiator");
  if (archetype.operator >= 2) signals.push("Markets read you as an operator-first builder");
  if (archetype.dealmaker >= 2) signals.push("Press tags you as a serial dealmaker");
  if (archetype.visionary >= 2) signals.push("Analysts frame you as a category visionary");
  return signals.slice(0, 2);
}

export function createInitialArchetype(): ArchetypeVector {
  return { ...EMPTY_ARCHETYPE };
}

export function archetypeScoreMultiplier(archetype: ArchetypeVector): number {
  const peak = Math.max(...Object.values(archetype));
  return 1 + peak * 0.02;
}