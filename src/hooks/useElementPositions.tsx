import { useState, useEffect, useCallback, RefObject } from "react";

export interface Position {
  x: number;           // Center X
  y: number;           // Top Y
  width: number;       // Card width
  height: number;      // Card height
  left: number;        // Left edge
  right: number;       // Right edge
  bottom: number;      // Bottom edge
}

export interface ElementPositions {
  hub: Position | null;
  cards: (Position | null)[];
  container: { width: number; height: number } | null;
}

export function useElementPositions(
  containerRef: RefObject<HTMLDivElement>,
  hubRef: RefObject<HTMLDivElement>,
  cardRefs: RefObject<HTMLDivElement>[]
): ElementPositions {
  const [positions, setPositions] = useState<ElementPositions>({
    hub: null,
    cards: [],
    container: null,
  });

  const calculatePositions = useCallback(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerLeft = containerRect.left;

    // Calculate hub position relative to container
    let hubPosition: Position | null = null;
    if (hubRef.current) {
      const hubRect = hubRef.current.getBoundingClientRect();
      const hubLeft = hubRect.left - containerLeft;
      const hubTop = hubRect.top - containerTop;
      hubPosition = {
        x: hubLeft + hubRect.width / 2,
        y: hubTop + hubRect.height / 2,
        width: hubRect.width,
        height: hubRect.height,
        left: hubLeft,
        right: hubLeft + hubRect.width,
        bottom: hubTop + hubRect.height,
      };
    }

    // Calculate card positions relative to container
    const cardPositions = cardRefs.map((ref) => {
      if (!ref.current) return null;
      const cardRect = ref.current.getBoundingClientRect();
      const left = cardRect.left - containerLeft;
      const top = cardRect.top - containerTop;
      return {
        x: left + cardRect.width / 2,
        y: top, // Top of card
        width: cardRect.width,
        height: cardRect.height,
        left: left,
        right: left + cardRect.width,
        bottom: top + cardRect.height,
      };
    });

    setPositions({
      hub: hubPosition,
      cards: cardPositions,
      container: {
        width: containerRect.width,
        height: containerRect.height,
      },
    });
  }, [containerRef, hubRef, cardRefs]);

  useEffect(() => {
    // Initial calculation
    calculatePositions();

    // Recalculate on resize
    const handleResize = () => {
      requestAnimationFrame(calculatePositions);
    };

    // Recalculate on scroll (positions relative to container change)
    let lastScrollTime = 0;
    const handleScroll = () => {
      const now = performance.now();
      if (now - lastScrollTime >= 16) { // ~60fps throttle
        lastScrollTime = now;
        requestAnimationFrame(calculatePositions);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Also recalculate after fonts load
    if (document.fonts) {
      document.fonts.ready.then(calculatePositions);
    }

    // Multiple delayed calculations to ensure accuracy after render
    const timeout1 = setTimeout(calculatePositions, 100);
    const timeout2 = setTimeout(calculatePositions, 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [calculatePositions]);

  return positions;
}
