import { describe, it, expect } from "vitest";

import {
  QUICK_ACTION_CATALOG,
  MAX_PINNED,
  togglePinned,
  resolvePinnedActions,
  parsePinnedIds,
} from "@/lib/sidebar-actions";

describe("QUICK_ACTION_CATALOG", () => {
  it("has unique ids and required fields", () => {
    const ids = QUICK_ACTION_CATALOG.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of QUICK_ACTION_CATALOG) {
      expect(a.label).toBeTruthy();
      expect(a.url.startsWith("/")).toBe(true);
      expect(a.iconName).toBeTruthy();
    }
  });
});

describe("togglePinned", () => {
  it("adds an id when absent", () => {
    expect(togglePinned([], "new-note")).toEqual(["new-note"]);
  });

  it("removes an id when present", () => {
    expect(togglePinned(["new-note", "crypto"], "new-note")).toEqual(["crypto"]);
  });

  it("does not exceed MAX_PINNED", () => {
    const full = QUICK_ACTION_CATALOG.slice(0, MAX_PINNED).map((a) => a.id);
    const result = togglePinned(full, "data");
    expect(result).toEqual(full); // no-op at capacity
    expect(result.length).toBe(MAX_PINNED);
  });

  it("still removes at capacity (toggle off works even when full)", () => {
    const full = QUICK_ACTION_CATALOG.slice(0, MAX_PINNED).map((a) => a.id);
    expect(togglePinned(full, full[0])).not.toContain(full[0]);
  });

  it("returns a new array (does not mutate input)", () => {
    const input = ["crypto"];
    const out = togglePinned(input, "new-note");
    expect(input).toEqual(["crypto"]);
    expect(out).not.toBe(input);
  });
});

describe("resolvePinnedActions", () => {
  it("resolves ids to catalog entries in order", () => {
    const resolved = resolvePinnedActions(["crypto", "new-note"]);
    expect(resolved.map((a) => a.id)).toEqual(["crypto", "new-note"]);
  });

  it("drops unknown ids", () => {
    const resolved = resolvePinnedActions(["new-note", "does-not-exist"]);
    expect(resolved.map((a) => a.id)).toEqual(["new-note"]);
  });
});

describe("parsePinnedIds", () => {
  it("returns [] for non-array input", () => {
    expect(parsePinnedIds(null)).toEqual([]);
    expect(parsePinnedIds("nope")).toEqual([]);
    expect(parsePinnedIds(undefined)).toEqual([]);
  });

  it("keeps only known string ids", () => {
    expect(parsePinnedIds(["new-note", 42, "bogus", "crypto"])).toEqual(["new-note", "crypto"]);
  });
});
