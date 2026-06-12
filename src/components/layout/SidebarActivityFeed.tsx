import { useState } from "react";
import { Activity, ChevronDown, ChevronUp, FileText, CheckCircle2, Coins } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { useSidebarActivity } from "@/hooks/useSidebarActivity";
import { formatRelativeTime, type ActivityKind } from "@/lib/dashboard-metrics";

const KIND_ICON: Partial<Record<ActivityKind, ComponentType<{ className?: string }>>> = {
  note: FileText,
  task: CheckCircle2,
  crypto: Coins,
};

/**
 * Phase 4 M6 — Sidebar 3.0 mini activity feed. Collapsible section showing the
 * last 5 events (note edits, completed tasks, crypto trades). Hidden when the
 * sidebar is collapsed. Gated by the caller on FF_SIDEBAR_3.
 */
export function SidebarActivityFeed({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(true);
  const { events } = useSidebarActivity(!collapsed);

  if (collapsed || events.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground transition-colors hover:text-foreground/70"
      >
        <span className="flex items-center gap-1.5">
          <Activity className="h-3 w-3" />
          Activity
        </span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <ul className="space-y-1 px-2">
          {events.map((e, i) => {
            const Icon = KIND_ICON[e.kind] ?? Activity;
            return (
              <li
                key={`${e.at}-${i}`}
                className={cn("flex items-start gap-2 rounded-md px-3 py-1.5 text-xs")}
              >
                <Icon className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-foreground">{e.label}</p>
                  <p className="text-[10px] text-muted-foreground">{formatRelativeTime(e.at)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
