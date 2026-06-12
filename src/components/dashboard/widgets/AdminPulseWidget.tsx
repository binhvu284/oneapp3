import { UserPlus, Users } from "lucide-react";
import { useDataQuery } from "@/lib/data-layer";

/** Start-of-today ISO string (local), for the "signups today" filter. */
function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Phase 4 M5 — Canvas Dashboard 3.0. New signups today + active users.
 * Reads `oneapp_users` via the data-layer (admin-scoped; degrades to zeros when
 * RLS hides the rows).
 */
export default function AdminPulseWidget() {
  const { data: signupsData } = useDataQuery("oneapp_users", {
    queryOptions: {
      select: ["id"],
      filters: [{ column: "created_at", operator: "gte", value: startOfTodayISO() }],
      count: "exact",
      limit: 1,
    },
  });

  const { data: activeData } = useDataQuery("oneapp_users", {
    queryOptions: {
      select: ["id"],
      filters: [{ column: "is_active", operator: "eq", value: true }],
      count: "exact",
      limit: 1,
    },
  });

  const signupsToday = signupsData?.count ?? 0;
  const activeUsers = activeData?.count ?? 0;

  const items = [
    { icon: UserPlus, label: "Signups today", value: signupsToday },
    { icon: Users, label: "Active users", value: activeUsers },
  ];

  return (
    <div className="flex h-full items-center justify-around">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1 text-center">
          <item.icon className="h-4 w-4 text-primary" />
          <span className="text-lg font-bold text-foreground tabular-nums">{item.value}</span>
          <span className="text-[10px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
