import { describe, it, expect } from "vitest";
import { PHASE_1_FLAGS, PHASE_4_FLAGS } from "@/lib/feature-flags";

describe("feature flags", () => {
  it("exposes all seven Phase 1 flags", () => {
    expect(Object.keys(PHASE_1_FLAGS)).toEqual([
      "FF_FOUNDER_BLOCKS",
      "FF_NOTE_LINKS",
      "FF_TEMPLATES",
      "FF_INLINE_AI",
      "FF_DAILY_BRIEFING",
      "FF_NOTE_AGING",
      "FF_MOOD_ROUTING",
    ]);
  });

  it("Phase 1 flags are all booleans", () => {
    for (const value of Object.values(PHASE_1_FLAGS)) {
      expect(typeof value).toBe("boolean");
    }
  });

  it("Phase 1 is rolled out — flags resolve ON under the test env", () => {
    // Vitest runs with import.meta.env.DEV === true and no VITE_FF_* overrides,
    // so the rolled-out Phase 1 flags must all be enabled.
    for (const value of Object.values(PHASE_1_FLAGS)) {
      expect(value).toBe(true);
    }
  });

  it("exposes the Phase 4 (Interface 3.0) flags", () => {
    expect(Object.keys(PHASE_4_FLAGS)).toEqual([
      "FF_NEU_DESIGN",
      "FF_THEME_ENGINE",
      "FF_MICRO_INTERACTIONS",
    ]);
    for (const value of Object.values(PHASE_4_FLAGS)) {
      expect(typeof value).toBe("boolean");
    }
  });
});
