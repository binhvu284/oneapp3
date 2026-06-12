/**
 * OneApp 3 feature flags.
 *
 * Each flag gates a milestone. Defaults are read from Vite env vars so rollouts
 * can flip flags without a code change. When an env var is absent the flag falls
 * back to a per-environment default: `devDefault` in dev, `prodDefault` in prod.
 *
 * Phase 1 (OneNote 3.0) shipped and is now rolled out — its flags default ON in
 * both dev and prod. Phase 4 (Interface 3.0) is in progress — its flags default
 * ON in dev, OFF in prod until the milestone is signed off.
 */

const isDev = import.meta.env.DEV;

interface FlagDefaults {
  devDefault?: boolean;
  prodDefault?: boolean;
}

function flag(envValue: unknown, { devDefault = true, prodDefault = false }: FlagDefaults = {}): boolean {
  if (typeof envValue === "string") {
    return envValue === "1" || envValue.toLowerCase() === "true";
  }
  return isDev ? devDefault : prodDefault;
}

// ── Phase 1 — OneNote 3.0 (shipped, rolled out: prod default ON) ──────────
const ON_IN_PROD: FlagDefaults = { prodDefault: true };

export const FF_FOUNDER_BLOCKS = flag(import.meta.env.VITE_FF_FOUNDER_BLOCKS, ON_IN_PROD);
export const FF_NOTE_LINKS = flag(import.meta.env.VITE_FF_NOTE_LINKS, ON_IN_PROD);
export const FF_TEMPLATES = flag(import.meta.env.VITE_FF_TEMPLATES, ON_IN_PROD);
export const FF_INLINE_AI = flag(import.meta.env.VITE_FF_INLINE_AI, ON_IN_PROD);
export const FF_DAILY_BRIEFING = flag(import.meta.env.VITE_FF_DAILY_BRIEFING, ON_IN_PROD);
export const FF_NOTE_AGING = flag(import.meta.env.VITE_FF_NOTE_AGING, ON_IN_PROD);
export const FF_MOOD_ROUTING = flag(import.meta.env.VITE_FF_MOOD_ROUTING, ON_IN_PROD);

export const PHASE_1_FLAGS = {
  FF_FOUNDER_BLOCKS,
  FF_NOTE_LINKS,
  FF_TEMPLATES,
  FF_INLINE_AI,
  FF_DAILY_BRIEFING,
  FF_NOTE_AGING,
  FF_MOOD_ROUTING,
} as const;

// ── Phase 4 — Interface 3.0 (in progress: prod default OFF) ───────────────
export const FF_NEU_DESIGN = flag(import.meta.env.VITE_FF_NEU_DESIGN);
export const FF_THEME_ENGINE = flag(import.meta.env.VITE_FF_THEME_ENGINE);
export const FF_MICRO_INTERACTIONS = flag(import.meta.env.VITE_FF_MICRO_INTERACTIONS);

export const PHASE_4_FLAGS = {
  FF_NEU_DESIGN,
  FF_THEME_ENGINE,
  FF_MICRO_INTERACTIONS,
} as const;
