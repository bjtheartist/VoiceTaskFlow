import type { Entry } from "@/db/schema";

const MOOD_GLYPHS: Record<string, string> = {
  energized: "☀",
  steady: "◌",
  stretched: "⌁",
  drained: "☾",
  reflective: "✶",
};

export default function EntryCard({ entry }: { entry: Entry }) {
  const time = new Date(entry.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="rounded-xl border border-ink-700 bg-ink-900/60 p-5">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
        <span>{time}</span>
        {entry.mood && (
          <span className="flex items-center gap-1.5 text-ember-400/80">
            <span aria-hidden>{MOOD_GLYPHS[entry.mood] ?? "◌"}</span>
            {entry.mood}
          </span>
        )}
      </div>
      <p className="font-body text-[17px] leading-relaxed text-cream-100">
        {entry.summary}
      </p>
      <details className="mt-3">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 transition-colors hover:text-cream-200">
          full transcript
        </summary>
        <p className="mt-2 border-l-2 border-ink-600 pl-3 font-body text-[15px] italic leading-relaxed text-ink-300">
          {entry.transcript}
        </p>
      </details>
    </article>
  );
}
