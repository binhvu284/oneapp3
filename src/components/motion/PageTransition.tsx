import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMicroInteractions } from "@/hooks/useMicroInteractions";
import { TIMING, EXPO_OUT } from "@/lib/motion";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Phase 4 (Interface 3.0) — wraps page content with a cinematic fade+slide
 * transition on route change (PRD §6.3 F4.3). Exit: opacity→0 over 200ms.
 * Enter: y+20px→0 + opacity→1 over 400ms with expo-out easing. Falls back to
 * a plain div when micro-interactions are disabled.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const active = useMicroInteractions();
  const location = useLocation();

  if (!active) return <div className={className}>{children}</div>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: TIMING.fast } }}
        transition={{ duration: TIMING.page, ease: EXPO_OUT }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
