import { fmtMoney, fmtPct } from "@/lib/format";
import type { GameRun, NPC } from "./types";

export type SpecialistId =
  | "operators"
  | "bankers"
  | "lawyers"
  | "lobbyists"
  | "politicians"
  | "influencers";

export interface SpecialistInfo {
  id: SpecialistId;
  label: string;
  channel: string;
}

export const SPECIALISTS: SpecialistInfo[] = [
  { id: "operators", label: "Operators", channel: "Weekly deploy — field ops & capacity" },
  { id: "bankers", label: "Bankers", channel: "Capital desk — term sheets & rounds" },
  { id: "lawyers", label: "Lawyers", channel: "Deal flow — diligence & close" },
  { id: "lobbyists", label: "Lobbyists", channel: "Regulatory briefs & threat counters" },
  { id: "politicians", label: "Politicians", channel: "Key players & regulatory pressure" },
  { id: "influencers", label: "Influencers", channel: "Trust narrative & market push" },
];

export const NPC_ROLE_LABELS: Record<NPC["role"], string> = {
  vc: "Banker",
  rival: "Rival",
  journalist: "Influencer",
};

export interface ResourceSnapshot {
  cash: string;
  trust: string;
  influence: string;
  talent: string;
  talentDepth: number;
}

export function getResourceSnapshot(run: GameRun): ResourceSnapshot {
  return {
    cash: fmtMoney(run.cash),
    trust: `${run.reputation}`,
    influence: fmtPct(run.marketShare),
    talent: `${run.employees}`,
    talentDepth: run.productScore,
  };
}

export const VICTORY_SUBTITLE = "Complete 2 paths to win";