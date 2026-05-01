import { cn } from "@/lib/utils";
import type { ChangelogEntry as ChangelogEntryType } from "@/data/changelog";

interface ChangelogEntryProps {
  entry: ChangelogEntryType;
}

const SECTION_STYLES: Record<string, string> = {
  Added: "text-emerald-300 border-emerald-500/30 bg-emerald-500/5",
  Changed: "text-amber-300 border-amber-500/30 bg-amber-500/5",
  Fixed: "text-rose-300 border-rose-500/30 bg-rose-500/5",
};

function Section({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <span
        className={cn(
          "inline-block text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border mb-3",
          SECTION_STYLES[label]
        )}
      >
        {label}
      </span>
      <ul className="space-y-2 text-sm text-gray-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-gray-600 mt-1.5 w-1 h-1 rounded-full bg-gray-600 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChangelogEntry({ entry }: ChangelogEntryProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border p-6 sm:p-8 bg-gradient-to-b from-white/[0.03] to-transparent",
        entry.isCurrent
          ? "border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
          : "border-white/10"
      )}
    >
      <header className="flex flex-wrap items-center gap-3 mb-2">
        <span
          className={cn(
            "font-mono text-sm px-2.5 py-1 rounded-md border",
            entry.isCurrent
              ? "border-cyan-500/50 text-cyan-300 bg-cyan-500/10"
              : "border-white/15 text-gray-300 bg-white/5"
          )}
        >
          v{entry.version}
        </span>
        <time className="text-xs text-gray-500 tracking-wide">{entry.date}</time>
        {entry.isCurrent && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5">
            Current
          </span>
        )}
      </header>
      {entry.headline && (
        <p className="text-base sm:text-lg text-gray-100 mb-6 leading-snug">{entry.headline}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section label="Added" items={entry.added} />
        <Section label="Changed" items={entry.changed} />
        <Section label="Fixed" items={entry.fixed} />
      </div>
    </article>
  );
}
