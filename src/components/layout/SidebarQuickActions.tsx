import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePinnedActions, type PinnedAction } from "@/hooks/usePinnedActions";

interface SidebarQuickActionsProps {
  collapsed: boolean;
}

function resolveIcon(name: string): LucideIcon {
  const candidate = (Icons as unknown as Record<string, LucideIcon | undefined>)[
    name
  ];
  return candidate ?? Icons.Sparkles;
}

export function SidebarQuickActions({ collapsed }: SidebarQuickActionsProps) {
  const { actions } = usePinnedActions();
  const navigate = useNavigate();

  if (actions.length === 0) return null;

  const handleClick = (action: PinnedAction) => {
    if (action.url) {
      navigate(action.url);
      return;
    }
    if (action.command) {
      window.dispatchEvent(
        new CustomEvent("oneapp:quick-action", { detail: action.command }),
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className={cn(
        "mx-3 mt-2 mb-3 rounded-xl neu-surface p-1.5 flex items-center gap-1",
        collapsed && "mx-2 flex-col",
      )}
    >
      <TooltipProvider delayDuration={120}>
        {actions.map((action, idx) => {
          const Icon = resolveIcon(action.iconName);
          return (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => handleClick(action)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.15 + idx * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn(
                    "neu-press flex-1 min-w-0 flex items-center justify-center",
                    "h-9 rounded-lg text-muted-foreground hover:text-primary",
                    "hover:bg-primary/10 transition-colors",
                    collapsed && "w-full",
                  )}
                  aria-label={action.label}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {action.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </motion.div>
  );
}
