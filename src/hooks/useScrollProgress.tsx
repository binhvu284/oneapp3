import { useState, useEffect, useCallback, RefObject } from "react";

interface UseScrollProgressOptions {
  // Where in the viewport the element should start tracking (0 = top, 1 = bottom)
  startOffset?: number;
  // Where in the viewport the element should be fully complete
  endOffset?: number;
  // Throttle interval in ms (lower = more responsive)
  throttleMs?: number;
}

export function useScrollProgress(
  ref: RefObject<HTMLElement>,
  options: UseScrollProgressOptions = {}
) {
  const { 
    startOffset = 0.9,  // Start when element enters 90% from top
    endOffset = 0.1,    // Complete when element is at 10% from top
    throttleMs = 8      // ~120fps for smoother bidirectional response
  } = options;

  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const calculateProgress = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Element's position relative to viewport
    const elementTop = rect.top;
    
    // Calculate the scroll range
    const startTrigger = viewportHeight * startOffset;
    const endTrigger = viewportHeight * endOffset;
    const totalRange = startTrigger - endTrigger;
    
    // How far through the range we are
    const distanceFromStart = startTrigger - elementTop;
    
    // Calculate progress (0 to 1) - bidirectional
    let newProgress = distanceFromStart / totalRange;
    newProgress = Math.max(0, Math.min(1, newProgress));
    
    setProgress(newProgress);
    setIsComplete(newProgress >= 1);
  }, [ref, startOffset, endOffset]);

  useEffect(() => {
    let lastTime = 0;

    const handleScroll = () => {
      const now = performance.now();
      if (now - lastTime >= throttleMs) {
        lastTime = now;
        calculateProgress();
      }
    };

    // Wrap in RAF for smooth updates
    const onScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    // Initial calculation
    calculateProgress();

    // Listen to scroll events with passive for better performance
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", calculateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", calculateProgress);
    };
  }, [calculateProgress, throttleMs]);

  return { progress, isComplete };
}
