import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import oneappLogo from "@/assets/oneapp-logo.png";

interface ConstellationHubProps {
  isVisible: boolean;
  className?: string;
}

export const ConstellationHub = forwardRef<HTMLDivElement, ConstellationHubProps>(
  ({ isVisible, className }, ref) => {
    return (
      <div ref={ref} className={cn("relative flex items-center justify-center", className)}>
        {/* Outer soft glow */}
        <div
          className={cn(
            "absolute w-32 h-32 md:w-40 md:h-40 rounded-full",
            "bg-primary/20",
            "transition-all duration-1000",
            isVisible ? "opacity-100 animate-glow-soft" : "opacity-0"
          )}
          style={{ willChange: "opacity, filter" }}
        />
        
        {/* Middle breathing ring */}
        <div
          className={cn(
            "absolute w-24 h-24 md:w-32 md:h-32 rounded-full",
            "bg-gradient-radial from-primary/15 to-transparent",
            "transition-all duration-700 delay-200",
            isVisible ? "opacity-100 animate-hub-breathe" : "opacity-0 scale-90"
          )}
        />
        
        {/* Inner subtle glow */}
        <div
          className={cn(
            "absolute w-18 h-18 md:w-24 md:h-24 rounded-full",
            "bg-primary/5 blur-lg",
            "transition-all duration-500 delay-300",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Logo container */}
        <div
          className={cn(
            "relative z-10 w-14 h-14 md:w-18 md:h-18",
            "flex items-center justify-center",
            "transition-all duration-500 delay-400",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
          style={{ willChange: "transform, opacity" }}
        >
          <img
            src={oneappLogo}
            alt="OneApp"
            className="w-8 h-8 md:w-10 md:h-10 object-contain"
          />
        </div>
      </div>
    );
  }
);

ConstellationHub.displayName = "ConstellationHub";
