import { forwardRef } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface OrbitNodeData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  status?: "live" | "coming-soon";
}

interface OrbitNodeProps extends OrbitNodeData {
  isActive: boolean;
  isOtherActive: boolean;
  onInteract: (id: string | null) => void;
  delay: number;
  isVisible: boolean;
}

export const OrbitNode = forwardRef<HTMLDivElement, OrbitNodeProps>(
  ({ id, icon: Icon, title, description, color, status = "live", isActive, isOtherActive, onInteract, delay, isVisible }, ref) => {
    const isComingSoon = status === "coming-soon";

    return (
      <div
        ref={ref}
        className={cn(
          "orbit-node relative cursor-pointer transition-all duration-500",
          "flex flex-col items-center text-center",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0",
          isActive ? "z-20 scale-110" : "z-10 scale-100",
          isOtherActive ? "opacity-40" : "",
          isComingSoon && !isActive ? "opacity-60" : ""
        )}
        style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
        onMouseEnter={() => onInteract(id)}
        onMouseLeave={() => onInteract(null)}
        onTouchStart={() => onInteract(id)}
        onTouchEnd={() => onInteract(null)}
      >
        {/* Glow effect */}
        <div
          className={cn(
            "absolute -inset-4 rounded-full blur-xl transition-opacity duration-300",
            isActive ? "opacity-60" : "opacity-0"
          )}
          style={{ backgroundColor: `${color}40` }}
        />

        {/* Icon container */}
        <div
          className={cn(
            "relative w-14 h-14 md:w-16 md:h-16 rounded-xl",
            "flex items-center justify-center",
            "bg-[#0a0a12]/80 backdrop-blur-sm",
            "border transition-all duration-300",
            isComingSoon
              ? "border-dashed border-white/20"
              : isActive
              ? "border-opacity-100"
              : "border-white/10"
          )}
          style={{
            borderColor: isActive ? color : undefined,
            boxShadow: isActive ? `0 0 20px ${color}50, inset 0 0 10px ${color}20` : undefined,
          }}
        >
          <Icon
            className="w-6 h-6 md:w-7 md:h-7 transition-colors duration-300"
            style={{ color: isActive ? color : isComingSoon ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)" }}
          />

          {/* Coming soon pulse ring */}
          {isComingSoon && (
            <div
              className="absolute inset-0 rounded-xl animate-ping opacity-20"
              style={{ borderWidth: 1, borderStyle: "solid", borderColor: color }}
            />
          )}
        </div>

        {/* Label */}
        <span
          className={cn(
            "mt-2 text-xs md:text-sm font-medium transition-colors duration-300",
            isActive ? "text-white" : "text-white/60"
          )}
        >
          {title}
        </span>

        {/* Tooltip card — shows on hover */}
        <div
          className={cn(
            "absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-50",
            "px-3 py-2 rounded-xl bg-black/95 border",
            "text-xs flex flex-col items-start gap-1",
            "transition-all duration-200 pointer-events-none",
            "shadow-2xl min-w-[120px]",
            isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          )}
          style={{ borderColor: `${color}50` }}
        >
          <span className="text-white/90 font-semibold">{title}</span>
          <span className="text-white/50 text-[10px] leading-tight">{description}</span>
          <Badge
            className="text-[9px] px-1.5 py-0 h-4 mt-0.5"
            style={
              isComingSoon
                ? { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)" }
                : { backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }
            }
          >
            {isComingSoon ? "Coming Soon" : "Live"}
          </Badge>
        </div>
      </div>
    );
  }
);

OrbitNode.displayName = "OrbitNode";
