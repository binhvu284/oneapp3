import { describe, it, expect } from "vitest";

import {
  formatRelativeTime,
  computePortfolio,
  computeBurndown,
  startOfWeek,
  mergeActivity,
  buildNoteGraph,
  type HoldingRow,
  type TaskRow,
  type ActivityEvent,
  type NoteRow,
} from "@/lib/dashboard-metrics";

// ─── formatRelativeTime ────────────────────────────────────────────────────────

describe("formatRelativeTime", () => {
  const now = new Date("2026-06-12T12:00:00Z");

  it("returns 'just now' for <60s", () => {
    expect(formatRelativeTime(new Date("2026-06-12T11:59:30Z"), now)).toBe("just now");
  });

  it("formats minutes / hours / days", () => {
    expect(formatRelativeTime(new Date("2026-06-12T11:30:00Z"), now)).toBe("30m ago");
    expect(formatRelativeTime(new Date("2026-06-12T09:00:00Z"), now)).toBe("3h ago");
    expect(formatRelativeTime(new Date("2026-06-10T12:00:00Z"), now)).toBe("2d ago");
  });

  it("handles future timestamps and invalid input gracefully", () => {
    expect(formatRelativeTime(new Date("2026-06-12T13:00:00Z"), now)).toBe("just now");
    expect(formatRelativeTime("not-a-date", now)).toBe("—");
  });
});

// ─── computePortfolio ──────────────────────────────────────────────────────────

describe("computePortfolio", () => {
  it("sums value and cost, computes change %, and finds top mover", () => {
    const holdings: HoldingRow[] = [
      { coin_symbol: "BTC", quantity: 1, avg_buy_price: 100, current_price: 150 }, // +50%
      { coin_symbol: "ETH", quantity: 2, avg_buy_price: 50, current_price: 40 }, // -20%
    ];
    const s = computePortfolio(holdings);
    expect(s.totalValue).toBe(150 + 80);
    expect(s.totalCost).toBe(100 + 100);
    expect(s.changePct).toBeCloseTo(15, 5); // (230-200)/200
    expect(s.topMover).toEqual({ symbol: "BTC", changePct: 50 });
  });

  it("falls back to avg_buy_price when current_price is null", () => {
    const s = computePortfolio([
      { coin_symbol: "DOGE", quantity: 10, avg_buy_price: 2, current_price: null },
    ]);
    expect(s.totalValue).toBe(20);
    expect(s.changePct).toBe(0);
  });

  it("handles empty holdings without dividing by zero", () => {
    const s = computePortfolio([]);
    expect(s).toEqual({ totalValue: 0, totalCost: 0, changePct: 0, topMover: null });
  });
});

// ─── startOfWeek / computeBurndown ──────────────────────────────────────────────

describe("startOfWeek", () => {
  it("returns Monday 00:00 for a mid-week date", () => {
    // 2026-06-12 is a Friday
    const monday = startOfWeek(new Date("2026-06-12T15:30:00"));
    expect(monday.getDay()).toBe(1); // Monday
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);
  });

  it("returns same-day Monday when ref is Monday", () => {
    const monday = startOfWeek(new Date("2026-06-08T09:00:00")); // a Monday
    expect(monday.getDate()).toBe(8);
  });
});

describe("computeBurndown", () => {
  const weekStart = new Date("2026-06-08T00:00:00"); // Monday

  it("counts completed-this-week vs remaining", () => {
    const tasks: TaskRow[] = [
      { is_completed: true, updated_at: "2026-06-10T10:00:00", created_at: "2026-06-01T00:00:00" },
      { is_completed: true, updated_at: "2026-06-05T10:00:00", created_at: "2026-06-01T00:00:00" }, // before week → not counted
      { is_completed: false, updated_at: "2026-06-11T10:00:00", created_at: "2026-06-09T00:00:00" },
      { is_completed: false, updated_at: "2026-06-11T10:00:00", created_at: "2026-06-09T00:00:00" },
    ];
    const s = computeBurndown(tasks, weekStart);
    expect(s.completed).toBe(1);
    expect(s.remaining).toBe(2);
    expect(s.total).toBe(3);
    expect(s.completedPct).toBe(33);
  });

  it("returns 0% for no tasks", () => {
    expect(computeBurndown([], weekStart)).toEqual({
      completed: 0,
      remaining: 0,
      total: 0,
      completedPct: 0,
    });
  });
});

// ─── mergeActivity ──────────────────────────────────────────────────────────────

describe("mergeActivity", () => {
  it("sorts most-recent-first and caps at limit", () => {
    const events: ActivityEvent[] = [
      { kind: "note", label: "Note A", at: "2026-06-10T00:00:00Z" },
      { kind: "task", label: "Task B", at: "2026-06-12T00:00:00Z" },
      { kind: "crypto", label: "Trade C", at: "2026-06-11T00:00:00Z" },
    ];
    const merged = mergeActivity(events, 2);
    expect(merged.map((e) => e.label)).toEqual(["Task B", "Trade C"]);
  });

  it("drops entries with missing/invalid timestamps", () => {
    const events = [
      { kind: "note", label: "Valid", at: "2026-06-10T00:00:00Z" },
      { kind: "note", label: "Bad", at: "" },
      { kind: "note", label: "Worse", at: "nope" },
    ] as ActivityEvent[];
    const merged = mergeActivity(events);
    expect(merged).toHaveLength(1);
    expect(merged[0].label).toBe("Valid");
  });
});

// ─── buildNoteGraph ──────────────────────────────────────────────────────────────

describe("buildNoteGraph", () => {
  it("places first node at center and others on a circle", () => {
    const notes: NoteRow[] = [
      { id: "a", title: "Root", parent_id: null },
      { id: "b", title: "Child", parent_id: "a" },
      { id: "c", title: null, parent_id: "a" },
    ];
    const g = buildNoteGraph(notes);
    expect(g.nodes[0]).toMatchObject({ id: "a", x: 50, y: 50 });
    expect(g.nodes).toHaveLength(3);
    // Untitled fallback label
    expect(g.nodes[2].label).toBe("Untitled");
  });

  it("creates edges only for parents present in the capped set", () => {
    const notes: NoteRow[] = [
      { id: "a", title: "Root", parent_id: null },
      { id: "b", title: "Child", parent_id: "a" },
      { id: "orphan", title: "Orphan", parent_id: "missing" },
    ];
    const g = buildNoteGraph(notes);
    expect(g.edges).toEqual([{ from: "a", to: "b" }]);
  });

  it("caps nodes at max", () => {
    const notes: NoteRow[] = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      title: `N${i}`,
      parent_id: null,
    }));
    expect(buildNoteGraph(notes, 8).nodes).toHaveLength(8);
  });
});
