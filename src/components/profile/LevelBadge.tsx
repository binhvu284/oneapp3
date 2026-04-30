import { Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LevelBadgeProps {
  level?: string;
  description?: string;
}

export function LevelBadge({
  level = "General Admin",
  description = "This is the most powerful user in the entire OneApp system which has no limit when accessing OneApp functions.",
}: LevelBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-violet-500 to-cyan-500 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity animate-pulse" />
          <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-violet-500 to-cyan-500 rounded-full shadow-lg">
            <Crown className="w-4 h-4 text-yellow-300 drop-shadow-[0_0_4px_rgba(253,224,71,0.8)]" />
            <span className="font-bold text-white text-sm tracking-wide">
              {level}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-xs bg-card border border-border p-3 shadow-xl"
      >
        <p className="text-sm text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
