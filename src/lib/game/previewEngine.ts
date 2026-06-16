import { fmtMoney } from "@/lib/format";
import { computeOdds } from "./resolution";
import type { AcquisitionTarget, GameEvent, GameRun } from "./types";

export interface ConsequenceLine {
  label: string;
  tone: "good" | "bad" | "neutral" | "caution";
}

export interface ConsequencePreview {
  action: string;
  lines: ConsequenceLine[];
}

function ownershipAfterDilution(run: GameRun, amount: number, preMoney: number): number {
  const dilution = amount / (preMoney + amount);
  return run.founderOwnership * (1 - dilution);
}

export function buildTermSheetPreviews(run: GameRun, event: GameEvent): ConsequencePreview[] {
  const amount = event.payload?.amount ?? 0;
  const preMoney = event.payload?.preMoney ?? run.valuation;
  const odds = computeOdds("term_sheet", run, event);
  const vc = run.npcs.find((n) => n.role === "vc");
  const newOwnership = ownershipAfterDilution(run, amount, preMoney);

  return [
    {
      action: "Accept",
      lines: [
        { label: `Cash +${fmtMoney(amount)}`, tone: "good" },
        { label: `Ownership ${newOwnership.toFixed(0)}% (−${(run.founderOwnership - newOwnership).toFixed(0)}pp)`, tone: "caution" },
        { label: `${vc?.name ?? "VC"} trust likely +10`, tone: "good" },
        { label: `${(odds.final * 100).toFixed(0)}% close odds · rep +5 if success`, tone: "neutral" },
        { label: "~35% chance: follow-on interest next quarter", tone: "neutral" },
      ],
    },
    {
      action: "Walk",
      lines: [
        { label: `Preserve ${run.founderOwnership.toFixed(0)}% ownership`, tone: "good" },
        { label: `${vc?.name ?? "VC"} trust −0 to −15 if you later need them`, tone: "caution" },
        { label: "Rival may capitalize on your pause", tone: "bad" },
        { label: "Missed term sheet expires — rep −5", tone: "bad" },
      ],
    },
  ];
}

export function buildMaPreviews(run: GameRun, target: AcquisitionTarget): ConsequencePreview[] {
  const odds = computeOdds("ma_close", run, undefined, target);
  const price = target.valuation * 0.8;
  const breakupFee = price * 0.05;

  return [
    {
      action: "Acquire",
      lines: [
        { label: `Pay ~${fmtMoney(price)} (80% of ask)`, tone: "caution" },
        { label: `Synergy +${target.synergy.toFixed(0)} · share +2% · rep +3`, tone: "good" },
        { label: `${(odds.final * 100).toFixed(0)}% close odds`, tone: "neutral" },
        { label: `Fail costs ${fmtMoney(breakupFee)} breakup fee · rep −5`, tone: "bad" },
      ],
    },
  ];
}

export function buildThreatPreview(run: GameRun, event: GameEvent): ConsequencePreview[] {
  const odds = computeOdds("threat_mitigate", run, event);

  return [
    {
      action: "Mitigate",
      lines: [
        { label: `${(odds.final * 100).toFixed(0)}% chance to contain burn spike`, tone: "neutral" },
        { label: "Success: rep +2 · burn stabilizes", tone: "good" },
        { label: "Fail: rep −3 · burn keeps compounding", tone: "bad" },
        { label: "Ignoring lets threat fester (+4% burn/wk)", tone: "bad" },
      ],
    },
  ];
}

export function buildRewardPreview(run: GameRun, event: GameEvent): ConsequencePreview[] {
  const odds = computeOdds("customer_win", run, event);

  return [
    {
      action: "Close Deal",
      lines: [
        { label: `${(odds.final * 100).toFixed(0)}% close odds`, tone: "neutral" },
        { label: "Success: revenue +15% · rep +3", tone: "good" },
        { label: "Fail: momentum stalls — no revenue gain", tone: "bad" },
      ],
    },
  ];
}

export function buildDeclineUncertaintyPreview(run: GameRun, event: GameEvent): ConsequencePreview[] {
  const targetName = event.payload?.targetName ?? "target";

  return [
    {
      action: "Ignore",
      lines: [
        { label: `Preserve cash — ${targetName} stays on market`, tone: "neutral" },
        { label: "Rival may move first if rumor is real", tone: "bad" },
        { label: "Intel verification can clarify before you commit", tone: "neutral" },
      ],
    },
  ];
}