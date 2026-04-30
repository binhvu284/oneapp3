import { useState, useEffect, useCallback, useRef, RefObject } from "react";

export interface PhaseConfig {
  id: string;
  duration: number; // Duration of this phase in ms
}

export interface AnimationPhaseState {
  isActive: boolean;
  isComplete: boolean;
  startDelay: number; // Delay from trigger point
  duration: number;
}

interface UseSequentialAnimationOptions {
  triggerOffset?: number; // 0-1, when section enters viewport to trigger (default 0.15)
  phaseDuration?: number; // Default duration per phase (500ms)
  phases: PhaseConfig[];
}

interface UseSequentialAnimationReturn {
  isTriggered: boolean;
  triggerTime: number | null;
  getPhaseState: (phaseId: string) => AnimationPhaseState;
  getPhaseDelay: (phaseId: string) => number;
  scrollProgress: number; // For scroll-linked phases like bottom connector
  totalDuration: number;
}

export function useSequentialAnimation(
  ref: RefObject<HTMLElement>,
  options: UseSequentialAnimationOptions
): UseSequentialAnimationReturn {
  const {
    triggerOffset = 0.15,
    phaseDuration = 500,
    phases,
  } = options;

  const [isTriggered, setIsTriggered] = useState(false);
  const [triggerTime, setTriggerTime] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const hasTriggeredRef = useRef(false);

  // Calculate cumulative delays for each phase
  const phaseDelays = useCallback(() => {
    const delays: Record<string, number> = {};
    let cumulativeDelay = 0;
    
    phases.forEach((phase) => {
      delays[phase.id] = cumulativeDelay;
      cumulativeDelay += phase.duration || phaseDuration;
    });
    
    return delays;
  }, [phases, phaseDuration]);

  // Calculate total animation duration
  const totalDuration = phases.reduce(
    (sum, phase) => sum + (phase.duration || phaseDuration),
    0
  );

  // Get phase state by ID
  const getPhaseState = useCallback(
    (phaseId: string): AnimationPhaseState => {
      const delays = phaseDelays();
      const phase = phases.find((p) => p.id === phaseId);
      const startDelay = delays[phaseId] ?? 0;
      const duration = phase?.duration ?? phaseDuration;

      if (!isTriggered || triggerTime === null) {
        return {
          isActive: false,
          isComplete: false,
          startDelay,
          duration,
        };
      }

      const elapsed = Date.now() - triggerTime;
      const phaseStart = startDelay;
      const phaseEnd = startDelay + duration;

      return {
        isActive: elapsed >= phaseStart,
        isComplete: elapsed >= phaseEnd,
        startDelay,
        duration,
      };
    },
    [isTriggered, triggerTime, phases, phaseDuration, phaseDelays]
  );

  // Get delay for a specific phase (for CSS transition-delay)
  const getPhaseDelay = useCallback(
    (phaseId: string): number => {
      const delays = phaseDelays();
      return delays[phaseId] ?? 0;
    },
    [phaseDelays]
  );

  // Scroll observer - trigger once and track progress
  useEffect(() => {
    if (!ref.current) return;

    const calculateProgress = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Start tracking when element enters viewport
      const startTrigger = viewportHeight * (1 - triggerOffset);
      const endTrigger = 0;
      const totalRange = startTrigger - endTrigger;
      
      const distanceFromStart = startTrigger - rect.top;
      let progress = distanceFromStart / totalRange;
      progress = Math.max(0, Math.min(1, progress));
      
      setScrollProgress(progress);

      // Trigger animation once when threshold is reached
      if (progress >= 0.05 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setIsTriggered(true);
        setTriggerTime(Date.now());
      }
    };

    // Initial calculation
    calculateProgress();

    const handleScroll = () => {
      requestAnimationFrame(calculateProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateProgress);
    };
  }, [ref, triggerOffset]);

  return {
    isTriggered,
    triggerTime,
    getPhaseState,
    getPhaseDelay,
    scrollProgress,
    totalDuration,
  };
}

// Default phase configuration for CoreValuesSection
export const CORE_VALUES_PHASES: PhaseConfig[] = [
  { id: "header", duration: 500 },      // Phase 0: Header + Logo fade in
  { id: "guides", duration: 500 },      // Phase 1: Guide lines fade in
  { id: "hubToJunction", duration: 500 }, // Phase 2: Hub → Junction path
  { id: "horizontal", duration: 500 },  // Phase 3: Horizontal expand
  { id: "vertical", duration: 500 },    // Phase 4a: Vertical paths
  { id: "cards", duration: 2000 },      // Phase 4b: Cards fade in (overlaps with vertical)
  { id: "merge", duration: 500 },       // Phase 5: Merge paths
  { id: "connector", duration: 500 },   // Phase 6: Bottom connector (scroll-linked)
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
