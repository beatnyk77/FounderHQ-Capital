import { seededRandom } from "./rng";
import type { EventBucket, GameEvent, GameRun } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

interface ChainTemplate {
  bucket: EventBucket;
  title: string;
  description: string;
  probability: number;
}

const CHAIN_MAP: Record<string, { success: ChainTemplate[]; fail: ChainTemplate[] }> = {
  term_sheet: {
    success: [
      {
        bucket: "threat",
        title: "Board seat tension",
        description: "New investor wants governance controls sooner than expected.",
        probability: 0.25,
      },
    ],
    fail: [
      {
        bucket: "uncertainty",
        title: "Bridge round rumor",
        description: "A smaller bridge round may be available on worse terms.",
        probability: 0.35,
      },
    ],
  },
  ma_close: {
    success: [
      {
        bucket: "reward",
        title: "Integration upside",
        description: "Cross-sell motion from the acquisition is gaining traction.",
        probability: 0.3,
      },
    ],
    fail: [
      {
        bucket: "uncertainty",
        title: "Backup target surfaces",
        description: "Another target in the space may be open to talks.",
        probability: 0.4,
      },
    ],
  },
  customer_win: {
    success: [
      {
        bucket: "opportunity",
        title: "Investor inbound",
        description: "Customer win triggered investor curiosity for a follow-on.",
        probability: 0.2,
      },
    ],
    fail: [],
  },
  threat_mitigate: {
    success: [],
    fail: [
      {
        bucket: "threat",
        title: "Threat escalation",
        description: "Initial mitigation failed — exposure is widening.",
        probability: 0.45,
      },
    ],
  },
};

export function maybeSpawnChain(
  run: GameRun,
  parentEvent: GameEvent | null,
  action: string,
  success: boolean,
): GameRun {
  const depth = parentEvent?.chainDepth ?? 0;
  if (depth >= 2) return run;

  const templates = CHAIN_MAP[action];
  if (!templates) return run;

  const options = success ? templates.success : templates.fail;
  if (!options.length) return run;

  const roll = seededRandom(run.seed, run.week, `chain-${action}-${success}`);
  let cumulative = 0;
  let picked: ChainTemplate | null = null;

  for (const template of options) {
    cumulative += template.probability;
    if (roll < cumulative) {
      picked = template;
      break;
    }
  }

  if (!picked) return run;

  const week = run.week + 1;
  const newEvent: GameEvent = {
    id: uid(),
    week,
    bucket: picked.bucket,
    title: picked.title,
    description: picked.description,
    resolved: false,
    expiresAtWeek: week + 2,
    parentEventId: parentEvent?.id,
    chainDepth: depth + 1,
  };

  const needsPause = picked.bucket === "opportunity" || picked.bucket === "uncertainty";

  return {
    ...run,
    status: needsPause ? "paused" : run.status,
    events: [...run.events, newEvent].slice(-24),
  };
}