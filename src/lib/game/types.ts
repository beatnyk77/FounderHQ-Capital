export type Industry = "fintech" | "saas" | "healthtech" | "climate" | "ai" | "consumer";
export type MacroRegime = "bull" | "neutral" | "bear";
export type RunStatus = "active" | "paused" | "exited" | "bankrupt" | "victorious";
export type EventBucket = "opportunity" | "threat" | "reward" | "uncertainty";
export type CompanyStage = "pre_seed" | "seed" | "series_a" | "series_b" | "growth";
export type ActionType = "term_sheet" | "ma_close" | "customer_win" | "threat_mitigate";
export type IntelTruthState = "unknown" | "confirmed" | "false_flag" | "conflicting";
export type IntelType = "rumor" | "regulatory" | "competitive" | "market";
export type VerifiedOutcome = "confirmed" | "conflicting" | "false_flag";
export type FundingStep = "review" | "counter" | "resolve";
export type VcCounterResponse = "pending" | "accepted_counter" | "rejected_counter";
export type DealRoomPhase = "screen" | "structure" | "close" | "integrate";
export type DiligenceLevel = "quick" | "standard" | "deep";
export type DealStructure = "cash" | "stock" | "earnout";
export type IntegrationFocus = "culture" | "product" | "sales";
export type NpcStance = "ally" | "neutral" | "hostile";
export type ArchetypeDimension = "aggressiveCapital" | "operator" | "dealmaker" | "visionary";

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

export interface MemoryEntry {
  week: number;
  action: string;
  sentiment: "positive" | "negative" | "neutral";
  narrative: string;
}

export interface NPC {
  id: string;
  name: string;
  role: "vc" | "rival" | "journalist";
  trust: number;
  stance: NpcStance;
  memory: MemoryEntry[];
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
  parentEventId?: string;
  chainDepth?: number;
  payload?: {
    roundType?: string;
    amount?: number;
    preMoney?: number;
    originalPreMoney?: number;
    targetId?: string;
    targetName?: string;
    price?: number;
    burnSpikeApplied?: boolean;
    fundingStep?: FundingStep;
    counterPreMoney?: number;
    boardSeat?: boolean;
    vcResponse?: VcCounterResponse;
  };
}

export interface IntelModifier {
  action: ActionType;
  value: number;
  label: string;
}

export interface NewsArticle {
  id: string;
  week: number;
  headline: string;
  body: string;
  outlet: string;
  sentiment: "positive" | "negative" | "neutral";
  intelType?: IntelType;
  verifiable?: boolean;
  verificationCost?: number;
  truthState?: IntelTruthState;
  verifiedOutcome?: VerifiedOutcome;
  conflictsWith?: string;
  relatedTargetId?: string;
  relatedEventId?: string;
  intelModifier?: IntelModifier;
}

export interface InvestigationRecord {
  articleId: string;
  week: number;
  outcome: VerifiedOutcome;
  cost: number;
}

export interface ReputationSwing {
  week: number;
  delta: number;
  source: string;
  narrative: string;
}

export interface DealRoomState {
  targetId: string;
  phase: DealRoomPhase;
  diligence?: DiligenceLevel;
  structure?: DealStructure;
  integration?: IntegrationFocus;
  revealedIntel: string[];
  oddsModifier: number;
  synergyMultiplier: number;
  closeSucceeded?: boolean;
  targetName?: string;
}

export interface ArchetypeVector {
  aggressiveCapital: number;
  operator: number;
  dealmaker: number;
  visionary: number;
}

export interface PortfolioAcquisition {
  targetId: string;
  name: string;
  week: number;
  integration: IntegrationFocus;
  synergyRealized: number;
}

export interface AcquisitionTarget {
  id: string;
  name: string;
  industry: Industry;
  valuation: number;
  healthScore: number;
  synergy: number;
  heatLevel: number;
  rivalInterest: number;
  rivalBid?: number;
  expiresAtWeek?: number;
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
  investigations: InvestigationRecord[];
  reputationSwings: ReputationSwing[];
  verifiedIntel: string[];
  publicNarrative: string;
  pulseCount: number;
  dealRoom: DealRoomState | null;
  archetype: ArchetypeVector;
  archetypeRevealed: boolean;
  portfolio: PortfolioAcquisition[];
}

export const EMPTY_ARCHETYPE: ArchetypeVector = {
  aggressiveCapital: 0,
  operator: 0,
  dealmaker: 0,
  visionary: 0,
};

export interface LeaderboardEntry {
  companyName: string;
  score: number;
  exitType?: string;
  week: number;
  date: string;
  victoryTracks?: string[];
}

export const OPERATE_COSTS = {
  hire: { cash: 80_000, label: "Field Ops", preview: "−$80K · +2 talent · +$12K burn · +3 depth" },
  rd: { cash: 50_000, label: "Build Capacity", preview: "−$50K · +5 talent depth · +$5K burn" },
  sales: { cash: 30_000, label: "Growth Push", preview: "−$30K · +8% revenue · +0.5% influence · influencer push" },
  cut: { cash: 0, label: "Restructure", preview: "−10% burn · −8 morale · −2 trust" },
} as const;