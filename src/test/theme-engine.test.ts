/**
 * Phase 4 M4 — Theme Engine tests (test-first; immutable once written).
 *
 * Scope:
 *   - themes.ts: 6-preset contract (names, required CSS var keys)
 *   - applyThemePreset / applyAccentHue: DOM side-effects
 *   - Accent-hue math: default (199) produces same output as old literal
 *   - FOUC guard: localStorage round-trip before DB response
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  THEME_PRESETS,
  PRESET_NAMES,
  DEFAULT_ACCENT_HUE,
  applyThemePreset,
  applyAccentHue,
  getStoredThemeState,
  storeThemeState,
} from "@/lib/themes";

// ─── 1. Preset contract ───────────────────────────────────────────────────────

describe("THEME_PRESETS — 6-preset contract", () => {
  it("exports exactly 6 presets", () => {
    expect(Object.keys(THEME_PRESETS)).toHaveLength(6);
  });

  it("preset keys match PRESET_NAMES tuple", () => {
    expect(PRESET_NAMES).toHaveLength(6);
    for (const name of PRESET_NAMES) {
      expect(THEME_PRESETS).toHaveProperty(name);
    }
  });

  it("contains exactly: Midnight, Carbon, Slate, Arctic, Sand, Obsidian", () => {
    expect(PRESET_NAMES).toEqual(
      expect.arrayContaining(["Midnight", "Carbon", "Slate", "Arctic", "Sand", "Obsidian"]),
    );
  });

  it("every preset declares --accent-hue", () => {
    for (const [name, vars] of Object.entries(THEME_PRESETS)) {
      expect(vars, `${name} missing --accent-hue`).toHaveProperty("--accent-hue");
    }
  });

  it("every --accent-hue is a numeric string in [0, 360]", () => {
    for (const [name, vars] of Object.entries(THEME_PRESETS)) {
      const hue = Number(vars["--accent-hue"]);
      expect(Number.isNaN(hue), `${name} --accent-hue is not a number`).toBe(false);
      expect(hue, `${name} hue out of range`).toBeGreaterThanOrEqual(0);
      expect(hue, `${name} hue out of range`).toBeLessThanOrEqual(360);
    }
  });

  it("every preset declares --neu-surface, --neu-shadow-dark, --neu-shadow-light", () => {
    const required = ["--neu-surface", "--neu-shadow-dark", "--neu-shadow-light"];
    for (const [name, vars] of Object.entries(THEME_PRESETS)) {
      for (const key of required) {
        expect(vars, `${name} missing ${key}`).toHaveProperty(key);
      }
    }
  });
});

// ─── 2. Default accent hue math ───────────────────────────────────────────────

describe("DEFAULT_ACCENT_HUE", () => {
  it("equals 199 — matching the current --primary hue (zero visual change)", () => {
    // The existing --primary was 199 89% 48%. Changing to var(--accent-hue) 89% 48%
    // with --accent-hue: 199 produces identical output. This test locks the invariant.
    expect(DEFAULT_ACCENT_HUE).toBe(199);
  });

  it("Midnight preset uses the default hue", () => {
    expect(Number(THEME_PRESETS["Midnight"]["--accent-hue"])).toBe(DEFAULT_ACCENT_HUE);
  });
});

// ─── 3. applyThemePreset DOM side-effects ────────────────────────────────────

describe("applyThemePreset", () => {
  beforeEach(() => {
    // Reset all inline styles before each test
    document.documentElement.removeAttribute("style");
  });

  it("sets --accent-hue on documentElement", () => {
    applyThemePreset("Carbon");
    const val = document.documentElement.style.getPropertyValue("--accent-hue");
    expect(val).not.toBe("");
    expect(Number(val)).toBeGreaterThanOrEqual(0);
  });

  it("sets --neu-surface on documentElement", () => {
    applyThemePreset("Obsidian");
    const val = document.documentElement.style.getPropertyValue("--neu-surface");
    expect(val).not.toBe("");
  });

  it("Midnight preset restores default hue (199)", () => {
    // First apply a different preset
    applyThemePreset("Sand");
    applyThemePreset("Midnight");
    expect(document.documentElement.style.getPropertyValue("--accent-hue")).toBe("199");
  });

  it("throws on unknown preset name", () => {
    expect(() => applyThemePreset("NonExistent" as never)).toThrow();
  });
});

// ─── 4. applyAccentHue DOM side-effects ──────────────────────────────────────

describe("applyAccentHue", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
  });

  it("sets --accent-hue to the given value", () => {
    applyAccentHue(270);
    expect(document.documentElement.style.getPropertyValue("--accent-hue")).toBe("270");
  });

  it("clamps values at 0 and 360", () => {
    applyAccentHue(-10);
    expect(Number(document.documentElement.style.getPropertyValue("--accent-hue"))).toBeGreaterThanOrEqual(0);

    applyAccentHue(400);
    expect(Number(document.documentElement.style.getPropertyValue("--accent-hue"))).toBeLessThanOrEqual(360);
  });
});

// ─── 5. FOUC guard: localStorage round-trip ──────────────────────────────────

describe("getStoredThemeState / storeThemeState", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns null when nothing is stored", () => {
    expect(getStoredThemeState()).toBeNull();
  });

  it("round-trips preset + hue", () => {
    storeThemeState({ preset: "Arctic", accentHue: 194 });
    const state = getStoredThemeState();
    expect(state).toEqual({ preset: "Arctic", accentHue: 194 });
  });

  it("returns null and does not throw when stored value is corrupted", () => {
    localStorage.setItem("oneapp-theme-engine", "not-json{{");
    expect(() => getStoredThemeState()).not.toThrow();
    expect(getStoredThemeState()).toBeNull();
  });
});
