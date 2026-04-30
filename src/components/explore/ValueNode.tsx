import { forwardRef } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValueNodeProps {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  delay: number; // CSS transition delay in ms
  isVisible: boolean;
  isActive: boolean;
  isOtherHovered: boolean;
  onHover: (id: string | null) => void;
  isTriggered: boolean;
  isAnimating: boolean; // Whether animation sequence is running
  hoverEnabled: boolean; // Whether hover interactions are allowed
}

export const ValueNode = forwardRef<HTMLDivElement, ValueNodeProps>(
  (
    {
      id,
      icon: Icon,
      title,
      subtitle,
      gradientFrom,
      gradientTo,
      delay,
      isVisible,
      isActive,
      isOtherHovered,
      onHover,
      isTriggered,
      isAnimating,
      hoverEnabled,
    },
    ref
  ) => {
    // Border becomes active when card is visible and triggered
    const borderActive = isTriggered && isVisible;
    
    // Hover is controlled by hoverEnabled (NOT by isAnimating)
    const shouldShowHoverScale = hoverEnabled && isActive;
    const shouldDimOthers = hoverEnabled && isOtherHovered && !isActive;

    // Block hover events entirely while hover is disabled
    const handleMouseEnter = () => {
      if (hoverEnabled) {
        onHover(id);
      }
    };
    const handleMouseLeave = () => {
      if (hoverEnabled) {
        onHover(null);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative group cursor-pointer",
          isTriggered && isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          shouldShowHoverScale ? "scale-105 z-30" : "scale-100 z-20",
          shouldDimOthers ? "opacity-60" : "",
          // Disable pointer events while hover is disabled (prevents any hover glitches)
          hoverEnabled ? "pointer-events-auto" : "pointer-events-none"
        )}
        style={{
          // Separate transitions: animation uses opacity+transform, hover uses only transform
          transition: isAnimating
            ? `opacity 1000ms ease-out ${delay}ms, transform 1000ms ease-out ${delay}ms`
            : `transform 300ms ease-out, opacity 300ms ease-out`,
          willChange: "transform, opacity",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glow effect on hover */}
        <div
          className={cn(
            "absolute -inset-2 rounded-2xl blur-xl transition-opacity duration-300",
            isActive ? "opacity-60" : "opacity-0"
          )}
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}40, ${gradientTo}40)`,
          }}
        />

        {/* Solid card with reactive border */}
        <div
          className={cn(
            "relative p-5 md:p-6 rounded-2xl",
            "bg-[#0a0a12] backdrop-blur-sm",
            "border border-white/10",
            "transition-all duration-500"
          )}
          style={{
            borderColor: borderActive ? `${gradientFrom}60` : undefined,
            boxShadow: borderActive 
              ? `0 0 20px ${gradientFrom}30, inset 0 0 10px ${gradientFrom}10`
              : isActive 
                ? `0 0 20px ${gradientFrom}30`
                : undefined,
            transitionDelay: borderActive ? `${delay + 500}ms` : "0ms",
          }}
        >
          {/* Gradient border overlay on hover */}
          <div
            className={cn(
              "absolute inset-0 rounded-2xl pointer-events-none",
              "transition-opacity duration-300",
              isActive ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}30, transparent 50%, ${gradientTo}30)`,
            }}
          />

          {/* Icon */}
          <div
            className={cn(
              "relative w-12 h-12 md:w-14 md:h-14 rounded-xl mb-4",
              "flex items-center justify-center",
              "transition-all duration-300"
            )}
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}20, ${gradientTo}20)`,
            }}
          >
            <Icon
              className="w-6 h-6 md:w-7 md:h-7 transition-all duration-300"
              style={{ color: gradientFrom }}
            />
          </div>

          {/* Text content */}
          <h3
            className={cn(
              "text-base md:text-lg font-semibold text-white mb-1",
              "transition-all duration-300"
            )}
          >
            {title}
          </h3>
          <p className="text-xs md:text-sm text-white/60 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    );
  }
);

ValueNode.displayName = "ValueNode";
