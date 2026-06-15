import type { NewsArticle } from "@/lib/game/types";

export function NewsTicker({ articles }: { articles: NewsArticle[] }) {
  if (!articles.length) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-500">
        Market wire quiet — advance the clock.
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-48">
      {articles.slice(0, 8).map((a) => (
        <div key={a.id} className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 px-3 py-2">
          <p className="text-[10px] text-zinc-600">Wk {a.week}</p>
          <p className="text-sm font-medium text-zinc-200">{a.headline}</p>
          <p className="text-xs text-zinc-500">{a.body}</p>
        </div>
      ))}
    </div>
  );
}