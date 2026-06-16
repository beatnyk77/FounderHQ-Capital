import type { Industry, MacroRegime } from "./types";

export const WEEK_MS = 150_000; // 2.5 min per game week
export const PULSE_MS = 15_000; // ambient world tick every 15s

export const INDUSTRIES: { id: Industry; label: string }[] = [
  { id: "fintech", label: "Fintech" },
  { id: "saas", label: "SaaS" },
  { id: "healthtech", label: "Healthtech" },
  { id: "climate", label: "Climate" },
  { id: "ai", label: "AI / ML" },
  { id: "consumer", label: "Consumer" },
];

export const REGIMES: { id: MacroRegime; label: string; desc: string }[] = [
  { id: "bull", label: "Bull Market", desc: "Cheap capital, high multiples" },
  { id: "neutral", label: "Neutral", desc: "Balanced conditions" },
  { id: "bear", label: "Bear Market", desc: "Tight credit, skeptical investors" },
];

export const MACRO_BASE: Record<MacroRegime, { sentiment: number; rate: number; gdp: number }> = {
  bull: { sentiment: 0.75, rate: 0.03, gdp: 0.04 },
  neutral: { sentiment: 0.5, rate: 0.05, gdp: 0.025 },
  bear: { sentiment: 0.25, rate: 0.07, gdp: 0.01 },
};