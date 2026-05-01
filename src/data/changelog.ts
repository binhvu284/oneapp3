export interface ChangelogEntry {
  version: string;
  date: string;
  isCurrent?: boolean;
  headline?: string;
  added?: string[];
  changed?: string[];
  fixed?: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "3.0.0-alpha",
    date: "2026-05-01",
    isCurrent: true,
    headline: "OneApp 3 Phase 1 lands — OneNote becomes the founder's second brain.",
    added: [
      "Founder-mode block types: Idea, Decision Log, Mood/Energy, Sprint",
      "Bi-directional `[[note title]]` links with backlinks panel",
      "Personal templates engine at /apps/onenote/templates",
      "Inline AI co-writer (Cmd+J) anchored to the active block",
      "Daily Briefing note auto-generated each morning",
    ],
    changed: [
      "Notes schema gains `is_bookmarked`, `note_date`, `last_opened_at`, `note_type`",
      "`note_tags.metadata` now carries `energy_level` for mood-to-task routing",
    ],
    fixed: [
      "Smart note aging clears the revisit badge as soon as the note is opened",
    ],
  },
  {
    version: "2.6.8",
    date: "2026-04-26",
    headline: "Foundation polish before the OneApp 3 cycle.",
    added: [
      "Public docs surface at /docs with sidebar, search, and TOC",
      "Schema sync panel for admin operators",
    ],
    changed: [
      "Tightened RLS policies on `oneapp_users` and `notes`",
      "TanStack Query staleTime defaults raised to 60s",
    ],
    fixed: [
      "Memory leak in DashboardGrid drag listener cleanup",
      "Mobile header gradient cut off on Safari",
    ],
  },
  {
    version: "2.6.0",
    date: "2026-02-14",
    headline: "OneCrypto portfolio tracker debuts.",
    added: [
      "Crypto holdings, transactions, and watchlist tables",
      "Live price polling via `crypto-prices` edge function",
      "Recharts portfolio visualization",
    ],
  },
  {
    version: "2.5.0",
    date: "2025-12-02",
    headline: "Bring-your-own-key AI chat goes live.",
    added: [
      "AI conversations + messages tables",
      "Multi-model support via `user_api_keys`",
      "Markdown + code-block rendering with copy buttons",
    ],
  },
  {
    version: "2.0.0",
    date: "2025-08-19",
    headline: "OneApp 2 — modular workspace + custom auth.",
    added: [
      "Custom `oneapp_users` auth replacing Supabase auth.users",
      "Canvas dashboard powered by react-grid-layout",
      "Public landing pages: Explore, Ecosystem, Journey, Forum",
    ],
  },
  {
    version: "1.0.0",
    date: "2024-09-01",
    headline: "OneApp 1 — the original founder's notebook.",
    added: [
      "Notes module with folders and inline tasks",
      "Theme system with three preset palettes",
      "First Vercel deployment",
    ],
  },
];

export function countShippedFeatures(): number {
  return changelog.reduce(
    (acc, entry) =>
      acc +
      (entry.added?.length ?? 0) +
      (entry.changed?.length ?? 0) +
      (entry.fixed?.length ?? 0),
    0
  );
}
