import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { useMicroInteractions } from "@/hooks/useMicroInteractions";
import { pressVariants, TIMING, EXPO_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PressableProps = HTMLMotionProps<"div"> & { className?: string };

/**
 * Phase 4 (Interface 3.0) — wraps any tappable surface with a tactile press
 * (scale 0.96 over 120ms). When micro-interactions are off (flag or reduced motion)
 * it renders a plain animated div with no tap response.
 */
export const Pressable = forwardRef<HTMLDivElement, PressableProps>(({ className, children, ...props }, ref) => {
  const active = useMicroInteractions();

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="rest"
      whileTap={active ? "pressed" : undefined}
      variants={pressVariants}
      transition={{ duration: TIMING.micro, ease: EXPO_OUT }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
Pressable.displayName = "Pressable";
