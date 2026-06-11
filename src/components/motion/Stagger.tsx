import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { useMicroInteractions } from "@/hooks/useMicroInteractions";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface StaggerProps {
  children: ReactNode;
  /** Delay between each child's entrance, in seconds. */
  stagger?: number;
  className?: string;
}

/**
 * Phase 4 (Interface 3.0) — reveals its children with a staggered fade+slide
 * (dropdowns, lists, card grids). Falls back to a plain wrapper when
 * micro-interactions are off. Wrap each child in {@link StaggerItem}.
 */
export function Stagger({ children, stagger = 0.04, className }: StaggerProps) {
  const active = useMicroInteractions();

  if (!active) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={staggerContainer(stagger)} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const active = useMicroInteractions();

  if (!active) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
