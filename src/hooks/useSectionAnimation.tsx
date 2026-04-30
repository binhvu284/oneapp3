import { useMemo, useCallback, RefObject, useState, useEffect } from "react";
import { useSectionVisibility, VISIBILITY_PRESETS } from "./useSectionVisibility";

export interface PhaseConfig {
  id: string;
  duration: number; // Duration of this phase in ms
}

export interface SectionAnimationOptions {
  /** 
   * Root margin for intersection observer
   * Use VISIBILITY_PRESETS or custom value
   * Default: center (trigger at viewport center)
   */
  rootMargin?: string;
  
  /** Animation phases configuration */
  phases: PhaseConfig[];
  
  /** Delay before observer starts (ensures hidden state renders first) */
  mountDelay?: number;
}

export interface SectionAnimationState {
  /** Whether section is currently in the trigger zone */
  isVisible: boolean;
  
  /** Whether section has ever been visible (triggers animation once) */
  hasBeenVisible: boolean;
  
  /** Whether animation should be triggered (stays true once triggered) */
  isTriggered: boolean;
  
  /** Whether animation sequence is currently running */
  isAnimating: boolean;
  
  /** Get delay for a specific phase (for CSS transition-delay) */
  getPhaseDelay: (phaseId: string) => number;
  
  /** Pre-calculated phase delays object */
  phaseDelays: Record<string, number>;
  
  /** Total duration of all phases */
  totalDuration: number;
}

/**
 * useSectionAnimation - Simplified section animation system
 * 
 * Features:
 * - Intersection Observer for precise visibility detection
 * - Once-only animation (no reset on scroll up)
 * - Phase management for sequential element animations
 * - CSS-based transitions for GPU acceleration
 * - Mount delay to ensure animation plays from start on navigation
 * 
 * @example
 * ```tsx
 * const sectionRef = useRef<HTMLDivElement>(null);
 * const { isTriggered, phaseDelays } = useSectionAnimation(
 *   sectionRef,
 *   { phases: [{ id: "header", duration: 400 }, { id: "content", duration: 600 }] }
 * );
 * 
 * return (
 *   <section
 *     ref={sectionRef}
 *     className={isTriggered ? "opacity-100" : "opacity-0"}
 *   >
 *     <h1 style={{ transitionDelay: `${phaseDelays.header}ms` }}>...</h1>
 *     <div style={{ transitionDelay: `${phaseDelays.content}ms` }}>...</div>
 *   </section>
 * );
 * ```
 */
export function useSectionAnimation(
  ref: RefObject<HTMLElement>,
  options: SectionAnimationOptions
): SectionAnimationState {
  const {
    rootMargin = VISIBILITY_PRESETS.center,
    phases,
    mountDelay = 150, // Increased to 150ms to ensure hidden state renders
  } = options;

  // Ready state - prevents immediate trigger on mount/navigation
  const [isReady, setIsReady] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Track visibility with Intersection Observer
  // Pass observerDelay to ensure observer waits for mount delay
  const { isVisible, hasBeenVisible } = useSectionVisibility(ref, {
    rootMargin,
    threshold: 0,
    once: true, // Animation only triggers once, never resets
    observerDelay: mountDelay, // Defer observer until after mount delay
  });

  // Add mount delay to ensure animation starts from hidden state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, mountDelay);
    
    return () => clearTimeout(timer);
  }, [mountDelay]);

  // Calculate total duration of all phases
  const totalDuration = useMemo(() => {
    return phases.reduce((sum, phase) => sum + phase.duration, 0);
  }, [phases]);

  // isTriggered = ready AND hasBeenVisible (ensures hidden state renders first)
  const isTriggered = isReady && hasBeenVisible;

  // Track animating state
  // NOTE: Keep this StrictMode-safe: effect may mount/cleanup/mount in dev.
  // We intentionally allow re-scheduling the timer after cleanup.
  useEffect(() => {
    if (!isTriggered) return;

    setIsAnimating(true);
    const timer = window.setTimeout(() => {
      setIsAnimating(false);
    }, totalDuration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isTriggered, totalDuration]);

  // Calculate cumulative delays for each phase
  const phaseDelays = useMemo(() => {
    const delays: Record<string, number> = {};
    let cumulativeDelay = 0;
    
    phases.forEach((phase) => {
      delays[phase.id] = cumulativeDelay;
      cumulativeDelay += phase.duration;
    });
    
    return delays;
  }, [phases]);

  // Get delay for a specific phase
  const getPhaseDelay = useCallback(
    (phaseId: string): number => {
      return phaseDelays[phaseId] ?? 0;
    },
    [phaseDelays]
  );

  return {
    isVisible,
    hasBeenVisible,
    isTriggered,
    isAnimating,
    getPhaseDelay,
    phaseDelays,
    totalDuration,
  };
}

// Re-export phase configuration for CoreValuesSection
export const CORE_VALUES_PHASES: PhaseConfig[] = [
  { id: "header", duration: 400 },      // Phase 0: Header + Logo fade in
  { id: "guides", duration: 300 },      // Phase 1: Guide lines fade in
  { id: "hubToJunction", duration: 400 }, // Phase 2: Hub → Junction path
  { id: "horizontal", duration: 400 },  // Phase 3: Horizontal expand
  { id: "vertical", duration: 400 },    // Phase 4a: Vertical paths
  { id: "cards", duration: 800 },       // Phase 4b: Cards fade in (reduced from 1500)
  { id: "merge", duration: 400 },       // Phase 5: Merge paths
  { id: "connector", duration: 400 },   // Phase 6: Bottom connector
];

// Helper to get phase delays easily
export function getPhaseDelays(phases: PhaseConfig[]): Record<string, number> {
  const delays: Record<string, number> = {};
  let cumulative = 0;
  
  phases.forEach((phase) => {
    delays[phase.id] = cumulative;
    cumulative += phase.duration;
  });
  
  return delays;
}

// Re-export visibility presets for convenience
export { VISIBILITY_PRESETS };
