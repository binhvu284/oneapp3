import { Database } from "lucide-react";
import { useLatestSystemConnection } from "@/hooks/useLatestSystemConnection";
import { formatRelativeTime } from "@/lib/dashboard-metrics";

/** Extracts a friendly provider/project name from a Supabase URL. */
function providerName(url: string | null): string {
  if (!url) return "Not configured";
  try {
    const host = new URL(url).hostname;
    const ref = host.split(".")[0];
    return ref ? `Supabase · ${ref}` : "Supabase";
  } catch {
    return "Supabase";
  }
}

/**
 * Phase 4 M5 — Canvas Dashboard 3.0. Provider name, connection status, and last
 * health check. Reads the latest `system_connection` row via the shared hook.
 */
export default function DBHealthWidget() {
  const row = useLatestSystemConnection();
  const healthy = row?.is_active === true && row?.connection_status !== "error";

  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-primary" />
        <span className="truncate text-sm font-medium text-foreground">{providerName(row?.supabase_url ?? null)}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className={`h-2 w-2 rounded-full ${healthy ? "bg-success" : "bg-muted-foreground/40"}`} />
        <span className="text-muted-foreground">{healthy ? "Connected" : row ? "Inactive" : "No connection"}</span>
      </div>
      {row?.last_tested_at && (
        <p className="text-[10px] text-muted-foreground">Checked {formatRelativeTime(row.last_tested_at)}</p>
      )}
    </div>
  );
}
