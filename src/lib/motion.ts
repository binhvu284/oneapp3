/**
 * Phase 4 (Interface 3.0) — shared motion design tokens for the micro-interaction
 * library (PRD §6.3 F4.2). Centralizes easing, timing, springs, and reusable
 * Framer Motion variants so every interaction across the app feels consistent.
 *
 * These are pure data — components opt in via the `useMicroInteractions()` hook,
 * which gates on the `FF_MICRO_INTERACTIONS` flag and `prefers-reduced-motion`.
 */
import type { Transition, Variants } from "framer-motion";

/** Expo-out cubic-bezier — the OneApp 3 cinematic easing (matches `.neu-card`). */
export const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Canonical durations (seconds). */
export const TIMING = {
  micro: 0.12, // press / tap feedback
  fast: 0.2, // hover + small reveals
  page: 0.4, // module / page transitions
} as const;

/** Reusable spring presets. */
export const springs = {
  soft: { type: "spring", stiffness: 220, damping: 22 } as Transition,
  snappy: { type: "spring", stiffness: 320, damping: 24 } as Transition,
} as const;

/** Button / tappable press: scale down on tap, spring back on release. */
export const pressVariants: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.96 },
};

/** Card hover lift (translateY) — pairs with the neumorphic surface. */
export const cardHover = {
  y: -2,
  transition: { duration: TIMING.fast, ease: EXPO_OUT },
} as const;

/** Staggered reveal container — fades its children in, one after another. */
export const staggerContainer = (stagger = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
});

/** Child of a {@link staggerContainer}. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: TIMING.fast, ease: EXPO_OUT } },
};
