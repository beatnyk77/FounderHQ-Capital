import type { GameRun, MemoryEntry, NPC, NpcStance } from "./types";

const MAX_MEMORY = 6;

export function computeStance(npc: NPC): NpcStance {
  const recent = npc.memory.slice(0, 4);
  const score = recent.reduce((s, m) => {
    if (m.sentiment === "positive") return s + 1;
    if (m.sentiment === "negative") return s - 1;
    return s;
  }, 0);

  const trustBias = npc.trust >= 65 ? 1 : npc.trust <= 35 ? -1 : 0;
  const total = score + trustBias;

  if (total >= 2) return "ally";
  if (total <= -2) return "hostile";
  return "neutral";
}

export function recordNpcMemory(
  run: GameRun,
  role: NPC["role"],
  action: string,
  sentiment: MemoryEntry["sentiment"],
  narrative: string,
): GameRun {
  const entry: MemoryEntry = { week: run.week, action, sentiment, narrative };

  const npcs = run.npcs.map((n) => {
    if (n.role !== role) return n;
    const memory = [entry, ...n.memory].slice(0, MAX_MEMORY);
    const updated = { ...n, memory };
    return { ...updated, stance: computeStance(updated) };
  });

  return { ...run, npcs };
}

export function stanceLabel(stance: NpcStance): string {
  if (stance === "ally") return "Ally";
  if (stance === "hostile") return "Hostile";
  return "Neutral";
}

export function stanceColor(stance: NpcStance): string {
  if (stance === "ally") return "text-positive";
  if (stance === "hostile") return "text-negative";
  return "text-text-dim";
}