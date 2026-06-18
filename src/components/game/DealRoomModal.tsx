"use client";

import { fmtMoney } from "@/lib/format";
import type { DealRoomState, DiligenceLevel, GameRun } from "@/lib/game/types";

interface Props {
  run: GameRun;
  room: DealRoomState;
  onDiligence: (level: DiligenceLevel) => void;
  onStructure: (structure: "cash" | "stock" | "earnout") => void;
  onClose: () => void;
  onIntegrate: (focus: "culture" | "product" | "sales") => void;
  onDismiss: () => void;
}

const PHASES = ["screen", "structure", "close", "integrate"] as const;

export function DealRoomModal({
  run,
  room,
  onDiligence,
  onStructure,
  onClose,
  onIntegrate,
  onDismiss,
}: Props) {
  const target = run.targets.find((t) => t.id === room.targetId);
  if (!target) return null;

  const phaseIdx = PHASES.indexOf(room.phase);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-violet-500/40 bg-panel p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-violet-300">Lawyers — Legal Close</p>
            <h2 className="text-lg font-bold text-foreground">{target.name}</h2>
            <p className="font-mono text-xs text-text-dim">
              {fmtMoney(target.valuation)} · synergy +{target.synergy.toFixed(0)}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="rounded border border-panel-border px-2 py-1 text-[10px] text-text-dim hover:bg-background"
          >
            Walk
          </button>
        </div>

        <div className="mt-4 flex gap-1">
          {PHASES.map((p, i) => (
            <div
              key={p}
              className={`h-1 flex-1 rounded-full ${
                i < phaseIdx ? "bg-positive/60" : i === phaseIdx ? "bg-accent" : "bg-panel-border"
              }`}
            />
          ))}
        </div>

        {room.phase === "screen" && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-text-dim">Lawyers screen the target. Deeper diligence costs more but reveals risks and upside.</p>
            <div className="grid gap-2">
              {(
                [
                  { level: "quick" as const, cost: 10_000, label: "Quick screen", desc: "1 intel card" },
                  { level: "standard" as const, cost: 35_000, label: "Standard DD", desc: "2 intel cards" },
                  { level: "deep" as const, cost: 75_000, label: "Deep DD", desc: "3 cards · heat +10" },
                ] as const
              ).map((d) => (
                <button
                  key={d.level}
                  onClick={() => onDiligence(d.level)}
                  disabled={run.cash < d.cost}
                  className="rounded-lg border border-panel-border bg-background/60 px-3 py-2 text-left hover:border-accent/40 disabled:opacity-40"
                >
                  <span className="font-medium text-foreground">{d.label}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-negative">−{fmtMoney(d.cost)}</span>
                  <span className="text-[10px] text-text-dim">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {room.phase === "structure" && (
          <div className="mt-4 space-y-3">
            {room.revealedIntel.length > 0 && (
              <div className="rounded-lg border border-panel-border bg-background/50 p-2">
                <p className="text-[10px] font-semibold uppercase text-text-dim">DD findings</p>
                <ul className="mt-1 space-y-1">
                  {room.revealedIntel.map((intel) => (
                    <li key={intel} className="font-mono text-[10px] text-foreground">
                      · {intel}
                    </li>
                  ))}
                </ul>
                {room.oddsModifier !== 0 && (
                  <p className={`mt-1 font-mono text-[10px] ${room.oddsModifier >= 0 ? "text-positive" : "text-negative"}`}>
                    Net odds impact: {room.oddsModifier >= 0 ? "+" : ""}
                    {(room.oddsModifier * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-text-dim">Structure the deal:</p>
            <div className="grid gap-2">
              <button onClick={() => onStructure("cash")} className="rounded-lg border border-panel-border px-3 py-2 text-left hover:border-accent/40">
                <span className="font-medium">Cash</span>
                <span className="block text-[10px] text-text-dim">80% of ask · standard close</span>
              </button>
              <button onClick={() => onStructure("stock")} className="rounded-lg border border-panel-border px-3 py-2 text-left hover:border-accent/40">
                <span className="font-medium">Stock mix</span>
                <span className="block text-[10px] text-text-dim">72% cash · −1.5pp ownership</span>
              </button>
              <button onClick={() => onStructure("earnout")} className="rounded-lg border border-panel-border px-3 py-2 text-left hover:border-accent/40">
                <span className="font-medium">Earnout</span>
                <span className="block text-[10px] text-text-dim">68% upfront · +15% synergy if integrated well</span>
              </button>
            </div>
          </div>
        )}

        {room.phase === "close" && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-text-dim">
              Final close on <span className="text-foreground">{room.structure}</span> terms. Roll determines if the deal binds.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              Execute Close
            </button>
          </div>
        )}

        {room.phase === "integrate" && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-positive">Deal closed — choose integration focus for synergy realization.</p>
            <div className="grid gap-2">
              <button onClick={() => onIntegrate("product")} className="rounded-lg border border-accent/40 px-3 py-2 text-left hover:bg-accent/10">
                <span className="font-medium text-accent">Product</span>
                <span className="block text-[10px] text-text-dim">Max product score · 1.2× synergy</span>
              </button>
              <button onClick={() => onIntegrate("culture")} className="rounded-lg border border-panel-border px-3 py-2 text-left hover:bg-panel">
                <span className="font-medium">Culture</span>
                <span className="block text-[10px] text-text-dim">+morale · steady integration</span>
              </button>
              <button onClick={() => onIntegrate("sales")} className="rounded-lg border border-panel-border px-3 py-2 text-left hover:bg-panel">
                <span className="font-medium">Sales</span>
                <span className="block text-[10px] text-text-dim">+revenue & share</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}