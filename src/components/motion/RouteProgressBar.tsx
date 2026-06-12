import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useMicroInteractions } from "@/hooks/useMicroInteractions";
import { EXPO_OUT } from "@/lib/motion";

type BarState = "hidden" | "loading" | "complete";

/**
 * Phase 4 (Interface 3.0) — thin accent-color progress bar that runs at the top
 * of the viewport on every route change (PRD §6.3 F4.3). Falls back to null when
 * micro-interactions are disabled. Mount once in App.tsx outside the route tree.
 */
export function RouteProgressBar() {
  const active = useMicroInteractions();
  const location = useLocation();
  const [state, setState] = useState<BarState>("hidden");

  useEffect(() => {
    if (!active) return;
    setState("loading");
    const completeTimer = setTimeout(() => setState("complete"), 400);
    const hideTimer = setTimeout(() => setState("hidden"), 600);
    return () => {
      clearTimeout(completeTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname, active]);

  if (!active) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] bg-primary"
      style={{ transformOrigin: "left" }}
      animate={
        state === "hidden"
          ? { scaleX: 0, opacity: 0 }
          : state === "loading"
            ? { scaleX: 0.85, opacity: 1 }
            : { scaleX: 1, opacity: 0 }
      }
      transition={
        state === "loading"
          ? { scaleX: { duration: 0.3, ease: EXPO_OUT }, opacity: { duration: 0 } }
          : state === "complete"
            ? { scaleX: { duration: 0.12 }, opacity: { duration: 0.15, delay: 0.1 } }
            : { duration: 0 }
      }
    />
  );
}
