export type Industry = "fintech" | "saas" | "healthtech" | "climate" | "ai" | "consumer";
export type MacroRegime = "bull" | "neutral" | "bear";
export type RunStatus = "active" | "paused" | "exited" | "bankrupt";
export type EventBucket = "opportunity" | "threat" | "reward" | "uncertainty";
export type CompanyStage = "pre_seed" | "seed" | "series_a" | "series_b" | "growth";
export type ActionType = "term_sheet" | "ma_close" | "customer_win" | "threat_mitigate";

export interface MacroState {
  interestRate: number;
  inflation: number;
  gdpGrowth: number;
  creditSpread: number;
  marketSentiment: number;
  regulatoryStance: number;
}

export interface OddsModifier {
  label: string;
  value: number;
}

export interface OddsBreakdown {
  base: number;
  modifiers: OddsModifier[];
  final: number;
}

export interface EventResolution {
  success: boolean;
  roll: number;
  threshold: number;
  modifiers: OddsModifier[];
}

export interface NPC {
  id: string;
  name: string;
  role: "vc" | "rival" | "journalist";
  trust: number;
}

export interface GameEvent {
  id: string;
  week: number;
  bucket: EventBucket;
  title: string;
  description: string;
  resolved: boolean;
  expiresAtWeek: number;
  resolution?: EventResolution;
  payload?: {
    roundType?: string;
    amount?: number;
    preMoney?: number;
    targetId?: string;
    targetName?: string;
    price?: number;
    burnSpikeApplied?: boolean;
  };
}

export interface NewsArticle {
  id: string;
  week: number;
  headline: string;
  body: string;
  outlet: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface AcquisitionTarget {
  id: string;
  name: string;
  industry: Industry;
  valuation: number;
  healthScore: number;
  synergy: number;
}

export interface FundingRound {
  type: string;
  amount: number;
  preMoney: number;
  week: number;
}

export interface WeekRecap {
  week: number;
  prevRevenue: number;
  prevValuation: number;
  revenueDelta: number;
  valuationDelta: number;
  eventsSummary: string[];
  resolutions: { title: string; success: boolean; roll: number; threshold: number }[];
  cliffhanger: string;
}

export interface GameRun {
  id: string;
  seed: number;
  companyName: string;
  industry: Industry;
  regime: MacroRegime;
  status: RunStatus;
  week: number;
  cash: number;
  burn: number;
  revenue: number;
  valuation: number;
  productScore: number;
  morale: number;
  marketShare: number;
  employees: number;
  reputation: number;
  stage: CompanyStage;
  totalRaised: number;
  peakValuation: number;
  founderOwnership: number;
  sectorIndex: number;
  macro: MacroState;
  npcs: NPC[];
  events: GameEvent[];
  news: NewsArticle[];
  targets: AcquisitionTarget[];
  scoutedTargets: string[];
  rounds: FundingRound[];
  acquisitions: number;
  valuationHistory: number[];
  weekRecap: WeekRecap | null;
  operateUsedThisWeek: boolean;
  nextTickAt: number | null;
  tickRemainingMs: number | null;
  score: number;
  startedAt: number;
}

export interface LeaderboardEntry {
  companyName: string;
  score: number;
  exitType?: string;
  week: number;
  date: string;
}

export const OPERATE_COSTS = {
  hire: { cash: 80_000, label: "Hire", preview: "−$80K · +2 employees · +$12K burn · +3 product" },
  rd: { cash: 50_000, label: "R&D", preview: "−$50K · +5 product · +$5K burn" },
  sales: { cash: 30_000, label: "Sales", preview: "−$30K · +8% revenue · +0.5% share" },
  cut: { cash: 0, label: "Cut", preview: "−10% burn · −8 morale · −2 rep" },
} as const;