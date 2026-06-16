export const colors = {
  base: "#0A0E17",
  panel: "#1A2332",
  panelBorder: "#2A3548",
  accent: "#00D4AA",
  positive: "#00D4AA",
  negative: "#FF4D6A",
  caution: "#F4A623",
  muted: "#64748B",
  text: "#F1F5F9",
  textDim: "#94A3B8",
} as const;

export const reputationTiers = [
  { min: 0, label: "Unknown" },
  { min: 40, label: "Notable" },
  { min: 60, label: "Respected" },
  { min: 80, label: "Legendary" },
] as const;

export function getReputationTier(rep: number): string {
  let tier: string = reputationTiers[0].label;
  for (const t of reputationTiers) {
    if (rep >= t.min) tier = t.label;
  }
  return tier;
}