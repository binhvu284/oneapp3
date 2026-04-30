import { useEffect, useState, RefObject } from "react";

export interface SectionVisibilityOptions {
  /** 
   * Offset from viewport edges where intersection triggers.
   * Format: "top right bottom left" (like CSS margin)
   * Default: "-50% 0px -50% 0px" (triggers at viewport center)
   * 
   * Negative values shrink the intersection zone:
   * - "-50% 0px -50% 0px" = only the middle strip counts
   * - "-25% 0px -25% 0px" = middle 50% of viewport
   */
  rootMargin?: string;
  
  /**
   * Percentage of element that must be visible (0-1)
   * Default: 0 (any pixel entering the zone triggers)
   */
  threshold?: number | number[];
  
  /**
   * If true, stays visible once triggered (no reset on exit)
   * Default: false
   */
  once?: boolean;
  
  /**
   * Delay before starting observer (ms)
   * Ensures hidden state renders before detection
   * Default: 0
   */
  observerDelay?: number;
}

export interface SectionVisibilityResult {
  /** Whether section is currently in the trigger zone */
  isVisible: boolean;
  /** Whether section has ever been visible */
  hasBeenVisible: boolean;
  /** Raw entry from IntersectionObserver (for advanced use) */
  entry: IntersectionObserverEntry | null;
}

/**
 * useSectionVisibility - Detects when a section enters/exits the viewport trigger zone
 * 
 * Uses IntersectionObserver for performance (no scroll listener).
 * The rootMargin creates an offset so animation triggers when section
 * reaches the CENTER of the viewport, not the edge.
 * 
 * @param ref - Ref to the section element to observe
 * @param options - Configuration options
 * @returns Visibility state
 */
export function useSectionVisibility(
  ref: RefObject<HTMLElement>,
  options: SectionVisibilityOptions = {}
): SectionVisibilityResult {
  const {
    rootMargin = "-50% 0px -50% 0px",
    threshold = 0,
    once = false,
    observerDelay = 0,
  } = options;
  
  const [isObserverReady, setIsObserverReady] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  // Observer delay effect - ensures hidden state renders first
  useEffect(() => {
    if (observerDelay > 0) {
      const timer = setTimeout(() => {
        setIsObserverReady(true);
      }, observerDelay);
      return () => clearTimeout(timer);
    } else {
      setIsObserverReady(true);
    }
  }, [observerDelay]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Wait for observer to be ready (after delay)
    if (!isObserverReady) return;

    // If "once" mode and already seen, don't observe
    if (once && hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        
        const isIntersecting = observerEntry.isIntersecting;
        setIsVisible(isIntersecting);
        
        if (isIntersecting) {
          setHasBeenVisible(true);
          
          // In "once" mode, stop observing after first visibility
          if (once) {
            observer.unobserve(element);
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin, threshold, once, hasBeenVisible, isObserverReady]);

  return {
    isVisible,
    hasBeenVisible,
    entry,
  };
}

/**
 * Preset rootMargin values for common use cases
 */
export const VISIBILITY_PRESETS = {
  /** Trigger when section reaches exact center of viewport */
  center: "-50% 0px -50% 0px",
  /** Trigger when section enters top 1/3 of viewport */
  upperThird: "-33% 0px -67% 0px",
  /** Trigger when section enters bottom 1/3 of viewport */
  lowerThird: "-67% 0px -33% 0px",
  /** Trigger when section enters top 1/4 of viewport */
  upperQuarter: "-25% 0px -75% 0px",
  /** Trigger as soon as any part is visible (edge of viewport) */
  edge: "0px 0px 0px 0px",
  /** Trigger 100px before section reaches viewport */
  early: "100px 0px 0px 0px",
} as const;
