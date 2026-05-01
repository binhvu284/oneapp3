import { useEffect, useRef } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function useKonamiCode(onUnlock: () => void) {
  const idxRef = useRef(0);
  const firedRef = useRef(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (firedRef.current) return;
      const expected = SEQUENCE[idxRef.current];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === expected) {
        idxRef.current += 1;
        if (idxRef.current === SEQUENCE.length) {
          firedRef.current = true;
          onUnlock();
          idxRef.current = 0;
        }
      } else {
        idxRef.current = key === SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onUnlock]);
}
