"use client";

import type { ConsequencePreview as Preview } from "@/lib/game/previewEngine";

const toneClass = {
  good: "text-positive",
  bad: "text-negative",
  neutral: "text-text-dim",
  caution: "text-caution",
};

interface Props {
  previews: Preview[];
}

export function ConsequencePreview({ previews }: Props) {
  if (!previews.length) return null;

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-panel-border bg-background/60 p-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">If you choose…</p>
      {previews.map((preview) => (
        <div key={preview.action}>
          <p className="font-mono text-[10px] font-medium text-accent">{preview.action}</p>
          <ul className="mt-0.5 space-y-0.5">
            {preview.lines.map((line) => (
              <li key={line.label} className={`font-mono text-[10px] ${toneClass[line.tone]}`}>
                · {line.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}