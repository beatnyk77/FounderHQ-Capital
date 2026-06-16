import { fmtMoney } from "@/lib/format";

interface Props {
  label: string;
  value: string;
  tone?: "default" | "good" | "warn" | "bad";
}

const tones = {
  default: "text-foreground",
  good: "text-positive",
  warn: "text-caution",
  bad: "text-negative",
};

export function StatBar({ label, value, tone = "default" }: Props) {
  return (
    <div className="rounded-lg border border-panel-border bg-panel/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-text-dim">{label}</p>
      <p className={`font-mono text-sm font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export function RunwayStat({ cash, burn, revenue }: { cash: number; burn: number; revenue: number }) {
  const netBurn = burn - revenue;
  const weeks = netBurn > 0 ? Math.floor(cash / netBurn) : 99;
  const tone = weeks < 8 ? "bad" : weeks < 16 ? "warn" : "good";
  return <StatBar label="Runway" value={`${weeks}w`} tone={tone} />;
}

export function CashStat({ cash }: { cash: number }) {
  return <StatBar label="Cash" value={fmtMoney(cash)} tone={cash < 200_000 ? "warn" : "good"} />;
}