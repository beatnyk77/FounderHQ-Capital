import type { NPC } from "./types";
import { seededRandom } from "./rng";

const VC_NAMES = ["Sarah Chen", "Marcus Webb", "Priya Kapoor", "James Holt", "Elena Vasquez"];
const RIVAL_NAMES = ["Derek Shaw", "Lena Ortiz", "Tom Bradley", "Aisha Nair", "Ryan Cole"];
const JOURNALIST_NAMES = ["Kate Morrison", "Felix Grant", "Nina Brooks", "Alex Turner", "Maya Singh"];
const OUTLETS = ["TechCrunch", "The Information", "Bloomberg", "FT Alphaville", "VentureBeat"];

export function seedNPCs(seed: number): NPC[] {
  const pick = (arr: string[], i: number) => arr[Math.floor(seededRandom(seed, 0, `npc-${i}`) * arr.length)];

  return [
    { id: "vc-1", name: pick(VC_NAMES, 1), role: "vc", trust: 50, stance: "neutral", memory: [] },
    { id: "rival-1", name: pick(RIVAL_NAMES, 2), role: "rival", trust: 30, stance: "neutral", memory: [] },
    { id: "journalist-1", name: pick(JOURNALIST_NAMES, 3), role: "journalist", trust: 50, stance: "neutral", memory: [] },
  ];
}

export function pickOutlet(seed: number, week: number): string {
  return OUTLETS[Math.floor(seededRandom(seed, week, "outlet") * OUTLETS.length)];
}