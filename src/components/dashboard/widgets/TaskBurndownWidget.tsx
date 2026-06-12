import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataQuery } from "@/lib/data-layer";
import { computeBurndown, type TaskRow } from "@/lib/dashboard-metrics";

/**
 * Phase 4 M5 — Canvas Dashboard 3.0. Tasks completed vs. remaining this week,
 * shown as a progress ring. Reads `note_items` via the data-layer.
 */
export default function TaskBurndownWidget() {
  const { user } = useAuthSafe();
  const { data } = useDataQuery<TaskRow>("note_items", {
    queryOptions: {
      select: ["is_completed", "updated_at", "created_at"],
      filters: [{ column: "user_id", operator: "eq", value: user?.id ?? "" }],
      order: [{ column: "updated_at", ascending: false }],
      limit: 200, // bound payload; the weekly ring only needs recent activity
    },
    enabled: !!user,
  });

  const tasks = (data?.data as TaskRow[] | null) ?? [];
  const { completed, remaining, completedPct } = computeBurndown(tasks);

  // Ring geometry
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (completedPct / 100) * circ;

  return (
    <div className="flex h-full items-center justify-around gap-3">
      <div className="relative h-[68px] w-[68px] shrink-0">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground tabular-nums">
          {completedPct}%
        </span>
      </div>
      <div className="space-y-1 text-xs">
        <p className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="font-medium text-foreground tabular-nums">{completed}</span>
          <span className="text-muted-foreground">done this week</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
          <span className="font-medium text-foreground tabular-nums">{remaining}</span>
          <span className="text-muted-foreground">remaining</span>
        </p>
      </div>
    </div>
  );
}
