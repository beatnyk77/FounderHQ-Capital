import { recordArchetypeSignal } from "./archetype";
import { maybeSpawnChain } from "./eventChains";
import { recordNpcMemory } from "./npcMemory";
import { recordReputationSwing } from "./reputationLedger";
import { seededRandom } from "./rng";
import { rollResolution } from "./resolution";
import type {
  DealRoomPhase,
  DealRoomState,
  DealStructure,
  DiligenceLevel,
  GameRun,
  IntegrationFocus,
} from "./types";

const DILIGENCE_COST: Record<DiligenceLevel, number> = {
  quick: 10_000,
  standard: 35_000,
  deep: 75_000,
};

const INTEL_CARDS = [
  { text: "Revenue concentration in top 3 accounts", mod: -0.05, tone: "risk" as const },
  { text: "Strong engineering retention", mod: 0.05, tone: "upside" as const },
  { text: "Pending litigation — unverified", mod: -0.08, tone: "risk" as const },
  { text: "Customer NPS above category average", mod: 0.04, tone: "upside" as const },
  { text: "Key founder staying post-close", mod: 0.06, tone: "upside" as const },
];

function structurePriceMultiplier(structure: DealStructure): number {
  if (structure === "stock") return 0.72;
  if (structure === "earnout") return 0.68;
  return 0.8;
}

function structureSynergyBase(structure: DealStructure): number {
  if (structure === "earnout") return 1.15;
  return 1;
}

export function openDealRoom(run: GameRun, targetId: string): GameRun {
  const target = run.targets.find((t) => t.id === targetId);
  if (!target) return run;

  return {
    ...run,
    dealRoom: {
      targetId,
      targetName: target.name,
      phase: "screen",
      revealedIntel: [],
      oddsModifier: 0,
      synergyMultiplier: 1,
    },
  };
}

export function closeDealRoom(run: GameRun): GameRun {
  return { ...run, dealRoom: null };
}

export function runDiligence(run: GameRun, level: DiligenceLevel): GameRun {
  const room = run.dealRoom;
  if (!room || room.phase !== "screen") return run;

  const cost = DILIGENCE_COST[level];
  if (run.cash < cost) return run;

  const cardCount = level === "quick" ? 1 : level === "standard" ? 2 : 3;
  const revealedIntel: string[] = [];
  let oddsModifier = 0;

  for (let i = 0; i < cardCount; i++) {
    const idx = Math.floor(seededRandom(run.seed, run.week, `dd-${room.targetId}-${i}`) * INTEL_CARDS.length);
    const card = INTEL_CARDS[idx];
    revealedIntel.push(card.text);
    oddsModifier += card.mod;
  }

  let next: GameRun = {
    ...run,
    cash: run.cash - cost,
    dealRoom: {
      ...room,
      phase: "structure",
      diligence: level,
      revealedIntel,
      oddsModifier,
    },
  };

  if (level === "deep") {
    next = {
      ...next,
      targets: next.targets.map((t) =>
        t.id === room.targetId ? { ...t, heatLevel: Math.min(100, t.heatLevel + 10) } : t,
      ),
    };
  }

  return next;
}

export function selectDealStructure(run: GameRun, structure: DealStructure): GameRun {
  const room = run.dealRoom;
  if (!room || room.phase !== "structure") return run;

  return {
    ...run,
    dealRoom: {
      ...room,
      phase: "close",
      structure,
      synergyMultiplier: structureSynergyBase(structure),
    },
  };
}

export function executeDealClose(run: GameRun): GameRun {
  const room = run.dealRoom;
  if (!room || room.phase !== "close" || !room.structure) return run;

  const target = run.targets.find((t) => t.id === room.targetId);
  if (!target || run.cash < target.valuation * 0.3) return run;

  const rolled = rollResolution(run, "ma_close", `dealroom-${room.targetId}`, undefined, target);
  const adjustedThreshold = Math.max(
    0.05,
    Math.min(0.95, rolled.threshold - room.oddsModifier),
  );
  const success = rolled.roll < adjustedThreshold;
  const resolution = { ...rolled.resolution, success, threshold: adjustedThreshold };

  if (!success) {
    const price = target.valuation * structurePriceMultiplier(room.structure);
    const breakupFee = price * 0.05;
    let next = recordReputationSwing(run, -5, target.name, "Deal room close failed — breakup fee");
    next = recordNpcMemory(next, "rival", "M&A fail", "positive", `Rival gained edge after ${target.name} collapsed`);
    next = recordArchetypeSignal(next, "dealmaker", 1);
    next = maybeSpawnChain(next, null, "ma_close", false);

    return {
      ...next,
      cash: next.cash - breakupFee,
      dealRoom: null,
      events: next.events.map((e) =>
        e.payload?.targetId === room.targetId ? { ...e, resolved: true, resolution } : e,
      ),
    };
  }

  return {
    ...run,
    dealRoom: { ...room, phase: "integrate", closeSucceeded: true },
  };
}

export function applyIntegration(run: GameRun, focus: IntegrationFocus): GameRun {
  const room = run.dealRoom;
  if (!room || room.phase !== "integrate" || !room.structure || !room.closeSucceeded) return run;

  const target = run.targets.find((t) => t.id === room.targetId);
  if (!target) return { ...run, dealRoom: null };

  const price = target.valuation * structurePriceMultiplier(room.structure);
  const synergyRealized = target.synergy * room.synergyMultiplier;

  let next = recordReputationSwing(run, 3, target.name, `Closed ${target.name} — integration begins`);
  next = recordNpcMemory(next, "journalist", "Acquisition", "positive", `${target.name} deal adds roll-up narrative`);
  next = recordArchetypeSignal(next, "dealmaker", 3);
  next = maybeSpawnChain(next, null, "ma_close", true);

  let productScore = next.productScore;
  let morale = next.morale;
  let revenue = next.revenue;
  let marketShare = next.marketShare;
  let founderOwnership = next.founderOwnership;

  if (focus === "product") {
    productScore = Math.min(100, productScore + synergyRealized / 2);
  } else if (focus === "culture") {
    morale = Math.min(100, morale + 8);
  } else {
    revenue *= 1.1;
    marketShare = Math.min(40, marketShare + 1);
  }

  if (room.structure === "stock") {
    founderOwnership = Math.max(10, founderOwnership - 1.5);
  }

  const portfolioEntry = {
    targetId: target.id,
    name: target.name,
    week: next.week,
    integration: focus,
    synergyRealized,
  };

  return {
    ...next,
    status: "active",
    cash: next.cash - price,
    employees: next.employees + 5,
    productScore,
    morale,
    revenue,
    marketShare,
    founderOwnership,
    acquisitions: next.acquisitions + 1,
    valuation: next.valuation + synergyRealized * 50_000,
    targets: next.targets.filter((t) => t.id !== room.targetId),
    scoutedTargets: next.scoutedTargets.filter((id) => id !== room.targetId),
    portfolio: [portfolioEntry, ...next.portfolio],
    dealRoom: null,
    events: next.events.map((e) =>
      e.payload?.targetId === room.targetId ? { ...e, resolved: true } : e,
    ),
  };
}

export function getDealRoomPhase(room: DealRoomState | null): DealRoomPhase | null {
  return room?.phase ?? null;
}