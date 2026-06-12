import { cn } from "@/lib/utils";
import { useSystemPulse, type PulseStatus } from "@/hooks/useSystemPulse";

const STATUS_COLOR: Record<PulseStatus, string> = {
  ok: "bg-success",
  down: "bg-destructive",
  unknown: "bg-muted-foreground/40",
};

const STATUS_LABEL: Record<PulseStatus, string> = {
  ok: "OK",
  down: "Down",
  unknown: "Unknown",
};

/**
 * Phase 4 M6 — Sidebar 3.0 system pulse strip. Three status dots (DB, deploy,
 * AI) at the very bottom of the sidebar. Gated by the caller on FF_SIDEBAR_3.
 */
export function SidebarPulseStrip({ collapsed }: { collapsed: boolean }) {
  const { db, deploy, ai } = useSystemPulse(true);
  const dots = [
    { key: "db", label: "DB", status: db },
    { key: "deploy", label: "Deploy", status: deploy },
    { key: "ai", label: "AI", status: ai },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2",
        collapsed && "flex-col gap-2 px-0 py-2",
      )}
    >
      {dots.map((d) => (
        <div
          key={d.key}
          className="flex items-center gap-1.5"
          title={`${d.label}: ${STATUS_LABEL[d.status]}`}
        >
          <span className={cn("h-2 w-2 rounded-full", STATUS_COLOR[d.status])} />
          {!collapsed && <span className="text-[10px] text-sidebar-foreground">{d.label}</span>}
        </div>
      ))}
    </div>
  );
}
