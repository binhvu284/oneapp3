import { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface RevealSectionProps {
  children: ReactNode;
  animation?: "up" | "scale" | "blur" | "left" | "right";
  delay?: number;
  className?: string;
  threshold?: number;
}

const animationClasses = {
  up: {
    hidden: "opacity-0 translate-y-16",
    visible: "opacity-100 translate-y-0",
  },
  scale: {
    hidden: "opacity-0 scale-90",
    visible: "opacity-100 scale-100",
  },
  blur: {
    hidden: "opacity-0 blur-sm translate-y-8",
    visible: "opacity-100 blur-0 translate-y-0",
  },
  left: {
    hidden: "opacity-0 -translate-x-16",
    visible: "opacity-100 translate-x-0",
  },
  right: {
    hidden: "opacity-0 translate-x-16",
    visible: "opacity-100 translate-x-0",
  },
};

export function RevealSection({
  children,
  animation = "blur",
  delay = 0,
  className,
  threshold = 0.1,
}: RevealSectionProps) {
  const { ref, isVisible } = useScrollReveal({ threshold });
  const reduceMotion = useReducedMotion();

  const animClass = animationClasses[animation];
  const showAnimated = !reduceMotion;

  return (
    <div
      ref={ref}
      className={cn(
        showAnimated && "transition-all duration-700 ease-out",
        showAnimated ? (isVisible ? animClass.visible : animClass.hidden) : animClass.visible,
        className
      )}
      style={showAnimated ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
