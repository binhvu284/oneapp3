import { LucideIcon, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignUpRoleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isLocked?: boolean;
  lockText?: string;
  onClick?: () => void;
  delay?: string;
  gradient: string;
  hoverGradient: string;
}

export function SignUpRoleCard({
  icon: Icon,
  title,
  description,
  isLocked = false,
  lockText = "Coming Soon",
  onClick,
  delay = "delay-100",
  gradient,
  hoverGradient,
}: SignUpRoleCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "relative group w-full p-3 md:p-4 rounded-xl border transition-all duration-500 animate-fade-up text-left",
        delay,
        isLocked
          ? "bg-white/5 border-white/10 cursor-not-allowed opacity-60"
          : "bg-white/5 border-white/10 hover:border-white/30 hover:-translate-y-0.5 hover:shadow-lg"
      )}
    >
      {/* Gradient overlay on hover */}
      {!isLocked && (
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            hoverGradient
          )}
        />
      )}

      {/* Locked badge */}
      {isLocked && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-white/60">
          <Lock className="w-2.5 h-2.5" />
          {lockText}
        </div>
      )}

      {/* Content - Horizontal Layout */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Icon with gradient background */}
        <div
          className={cn(
            "w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500",
            gradient,
            !isLocked && "group-hover:scale-105 group-hover:shadow-md"
          )}
        >
          <Icon className="w-5 h-5 md:w-5.5 md:h-5.5 text-white" />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-sm md:text-base font-semibold mb-0.5 transition-colors duration-300",
              isLocked ? "text-white/50" : "text-white group-hover:text-white"
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-xs leading-snug line-clamp-1",
              isLocked ? "text-white/30" : "text-white/50"
            )}
          >
            {description}
          </p>
        </div>

        {/* Arrow indicator for active cards */}
        {!isLocked && (
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
            <ChevronRight className="w-4 h-4 text-white/60" />
          </div>
        )}
      </div>
    </button>
  );
}
