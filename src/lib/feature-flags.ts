/**
 * Phase 1 (OneNote 3.0) feature flags.
 *
 * Each flag gates a milestone delivered in Phase 1. Defaults are read from
 * Vite env vars so production rollouts can flip flags without a code change.
 * In dev, flags default to ON so contributors can exercise the new behavior;
 * in prod, missing env vars resolve to OFF.
 */

const isDev = import.meta.env.DEV;

function flag(envValue: unknown, devDefault = true): boolean {
  if (typeof envValue === "string") {
    return envValue === "1" || envValue.toLowerCase() === "true";
  }
  return isDev ? devDefault : false;
}

export const FF_FOUNDER_BLOCKS = flag(import.meta.env.VITE_FF_FOUNDER_BLOCKS);
export const FF_NOTE_LINKS = flag(import.meta.env.VITE_FF_NOTE_LINKS);
export const FF_TEMPLATES = flag(import.meta.env.VITE_FF_TEMPLATES);
export const FF_INLINE_AI = flag(import.meta.env.VITE_FF_INLINE_AI);
export const FF_DAILY_BRIEFING = flag(import.meta.env.VITE_FF_DAILY_BRIEFING);
export const FF_NOTE_AGING = flag(import.meta.env.VITE_FF_NOTE_AGING);
export const FF_MOOD_ROUTING = flag(import.meta.env.VITE_FF_MOOD_ROUTING);

export const PHASE_1_FLAGS = {
  FF_FOUNDER_BLOCKS,
  FF_NOTE_LINKS,
  FF_TEMPLATES,
  FF_INLINE_AI,
  FF_DAILY_BRIEFING,
  FF_NOTE_AGING,
  FF_MOOD_ROUTING,
} as const;
