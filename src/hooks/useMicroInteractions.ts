import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FF_MICRO_INTERACTIONS } from "@/lib/feature-flags";

/**
 * Phase 4 (Interface 3.0) — single source of truth for whether the micro-interaction
 * library should animate. True only when the `FF_MICRO_INTERACTIONS` flag is on AND
 * the user has not requested reduced motion. Components fall back to static markup
 * when this returns false.
 */
export function useMicroInteractions(): boolean {
  const reduced = useReducedMotion();
  return FF_MICRO_INTERACTIONS && !reduced;
}
