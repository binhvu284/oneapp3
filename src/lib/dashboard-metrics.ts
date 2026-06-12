/**
 * Phase 4 M5 — Canvas Dashboard 3.0 pure metric helpers (PRD §6.3 F4.4).
 *
 * All functions here are pure (no React, no DOM, no I/O) so the widget
 * components stay thin and the math is unit-testable. Widgets fetch rows via
 * the data-layer (`useDataQuery`) and pass them through these helpers.
 */

// ─── Relative time ────────────────────────────────────────────────────────────

/** Formats a past timestamp as a compact "2h ago" / "just now" string. */
export function formatRelativeTime(value: string | number | Date, now: Date = new Date()): string {
  const then = value instanceof Date ? value : new Date(value);
  const diffMs = now.getTime() - then.getTime();
  if (Number.isNaN(diffMs)) return "—";
  if (diffMs < 0) return "just now";

  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ─── Crypto portfolio (CryptoPulseWidget) ────────────────────────────────────

export interface HoldingRow {
  coin_symbol: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number | null;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  changePct: number; // unrealized gain/loss % vs cost basis
  topMover: { symbol: string; changePct: number } | null;
}

/** Aggregates holdings into portfolio value + unrealized P/L + best performer. */
export function computePortfolio(holdings: HoldingRow[]): PortfolioSummary {
  let totalValue = 0;
  let totalCost = 0;
  let topMover: PortfolioSummary["topMover"] = null;

  for (const h of holdings) {
    const price = h.current_price ?? h.avg_buy_price;
    const value = h.quantity * price;
    const cost = h.quantity * h.avg_buy_price;
    totalValue += value;
    totalCost += cost;

    if (h.avg_buy_price > 0) {
      const movePct = ((price - h.avg_buy_price) / h.avg_buy_price) * 100;
      if (!topMover || movePct > topMover.changePct) {
        topMover = { symbol: h.coin_symbol, changePct: movePct };
      }
    }
  }

  const changePct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
  return { totalValue, totalCost, changePct, topMover };
}

// ─── Task burndown (TaskBurndownWidget) ──────────────────────────────────────

export interface TaskRow {
  is_completed: boolean;
  updated_at: string;
  created_at: string;
}

export interface BurndownSummary {
  completed: number;
  remaining: number;
  total: number;
  completedPct: number; // 0–100, rounded
}

/** Returns the Monday 00:00 of the week containing `ref` (local time). */
export function startOfWeek(ref: Date = new Date()): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
}

/**
 * Tasks completed vs. remaining for the current week. A task counts as
 * "completed this week" when it is completed and was last updated on/after
 * the week start; "remaining" counts all not-yet-completed tasks.
 */
export function computeBurndown(tasks: TaskRow[], weekStart: Date = startOfWeek()): BurndownSummary {
  let completed = 0;
  let remaining = 0;

  for (const t of tasks) {
    if (t.is_completed) {
      if (new Date(t.updated_at).getTime() >= weekStart.getTime()) completed += 1;
    } else {
      remaining += 1;
    }
  }

  const total = completed + remaining;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, remaining, total, completedPct };
}

// ─── Activity feed merge (Sidebar 3.0 + RecentActivity) ──────────────────────

export type ActivityKind = "note" | "task" | "crypto" | "chat" | "deploy";

export interface ActivityEvent {
  kind: ActivityKind;
  label: string;
  at: string; // ISO timestamp
}

/**
 * Merges activity events from multiple sources into a single most-recent-first
 * list, capped at `limit`. Invalid/empty entries are dropped.
 */
export function mergeActivity(events: ActivityEvent[], limit = 5): ActivityEvent[] {
  return events
    .filter((e) => e && e.at && !Number.isNaN(new Date(e.at).getTime()))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}

// ─── Note connection graph (NoteGraphWidget) ─────────────────────────────────

export interface NoteRow {
  id: string;
  title: string | null;
  parent_id: string | null;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number; // 0–100 (% of viewBox)
  y: number; // 0–100
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface NoteGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Builds a small radial layout for the note connection graph: the most-linked
 * notes sit toward the center, children fan out. Deterministic positions so the
 * render is stable across paints. Caps at `max` nodes for legibility.
 */
export function buildNoteGraph(notes: NoteRow[], max = 8): NoteGraph {
  const capped = notes.slice(0, max);
  const ids = new Set(capped.map((n) => n.id));

  const nodes: GraphNode[] = capped.map((n, i) => {
    // Place first node at center, rest evenly around a circle.
    if (i === 0) return { id: n.id, label: n.title || "Untitled", x: 50, y: 50 };
    const angle = (2 * Math.PI * (i - 1)) / Math.max(1, capped.length - 1);
    const radius = 38;
    return {
      id: n.id,
      label: n.title || "Untitled",
      x: Math.round(50 + radius * Math.cos(angle)),
      y: Math.round(50 + radius * Math.sin(angle)),
    };
  });

  const edges: GraphEdge[] = capped
    .filter((n) => n.parent_id && ids.has(n.parent_id))
    .map((n) => ({ from: n.parent_id as string, to: n.id }));

  return { nodes, edges };
}
