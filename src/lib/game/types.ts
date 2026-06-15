export type Industry = "fintech" | "saas" | "healthtech" | "climate" | "ai" | "consumer";
export type MacroRegime = "bull" | "neutral" | "bear";
export type RunStatus = "active" | "paused" | "exited" | "bankrupt";
export type EventBucket = "opportunity" | "threat" | "reward" | "uncertainty";
export type CompanyStage = "pre_seed" | "seed" | "series_a" | "series_b" | "growth";

export interface MacroState {
  interestRate: number;
  inflation: number;
  gdpGrowth: number;
  creditSpread: number;
  marketSentiment: number;
  regulatoryStance: number;
}

export interface GameEvent {
  id: string;
  week: number;
  bucket: EventBucket;
  title: string;
  description: string;
  resolved: boolean;
  expiresAtWeek: number;
  payload?: {
    roundType?: string;
    amount?: number;
    preMoney?: number;
    targetId?: string;
    targetName?: string;
    price?: number;
  };
}

export interface NewsArticle {
  id: string;
  week: number;
  headline: string;
  body: string;
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

export interface GameRun {
  id: string;
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
  macro: MacroState;
  events: GameEvent[];
  news: NewsArticle[];
  targets: AcquisitionTarget[];
  rounds: FundingRound[];
  acquisitions: number;
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