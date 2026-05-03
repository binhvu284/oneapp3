import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useActivityFeed,
  type ActivityKind,
} from "@/hooks/useActivityFeed";
import {
  FilePlus,
  CheckCircle2,
  Rocket,
  Database,
  Sparkles,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  note_created: FilePlus,
  note_saved: FilePlus,
  task_completed: CheckCircle2,
  deploy_triggered: Rocket,
  deploy_succeeded: Rocket,
  deploy_failed: AlertCircle,
  query_run: Database,
  ai_message: Sparkles,
  system: Activity,
};

const KIND_TONE: Record<ActivityKind, string> = {
  note_created: "text-sky-400",
  note_saved: "text-sky-400",
  task_completed: "text-emerald-400",
  deploy_triggered: "text-amber-400",
  deploy_succeeded: "text-emerald-400",
  deploy_failed: "text-red-400",
  query_run: "text-violet-400",
  ai_message: "text-fuchsia-400",
  system: "text-muted-foreground",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface SidebarActivityFeedProps {
  collapsed: boolean;
}

export function SidebarActivityFeed({ collapsed }: SidebarActivityFeedProps) {
  const { events } = useActivityFeed();
  const [open, setOpen] = useState(true);

  if (collapsed) {
    return (
      <div className="flex justify-center py-2">
        <div className="relative">
          <Activity className="w-3.5 h-3.5 text-muted-foreground/60" />
          {events.length > 0 && (
            <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground hover:text-foreground/80 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          Activity
          {events.length > 0 && (
            <span className="ml-1 px-1.5 rounded-full bg-primary/15 text-primary text-[9px] font-semibold">
              {events.length}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-300",
            !open && "-rotate-90",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {events.length === 0 ? (
              <div className="px-3 py-3 text-[11px] text-muted-foreground/60 italic">
                No recent activity yet.
              </div>
            ) : (
              <ul className="space-y-0.5 px-1 pb-2">
                <AnimatePresence initial={false}>
                  {events.map((event) => {
                    const Icon = KIND_ICON[event.kind];
                    const tone = KIND_TONE[event.kind];
                    return (
                      <motion.li
                        key={event.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{
                          duration: 0.25,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="group flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent/10 transition-colors"
                      >
                        <Icon
                          className={cn(
                            "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                            tone,
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] leading-snug text-foreground/80 truncate">
                            {event.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            {timeAgo(event.createdAt)}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
