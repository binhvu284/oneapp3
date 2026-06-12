import { Rocket, CheckCircle2, Clock } from "lucide-react";
import { useLatestSystemConnection } from "@/hooks/useLatestSystemConnection";
import { formatRelativeTime } from "@/lib/dashboard-metrics";
import { WidgetEmpty } from "./WidgetEmpty";

/**
 * Phase 4 M5 — Canvas Dashboard 3.0. Deploy/sync status. OneApp has no dedicated
 * deploy log table yet, so this surfaces the most recent system-connection health
 * check as the latest "sync" event and shows an honest empty state otherwise.
 */
export default function DeployStatusWidget() {
  const row = useLatestSystemConnection();

  if (!row?.last_tested_at) {
    return <WidgetEmpty icon={Rocket} message="No deployments tracked yet" />;
  }

  const ok = row.connection_status !== "error";

  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Rocket className="h-3.5 w-3.5 text-primary" />
        Latest sync
      </span>
      <div className="flex items-center gap-2 rounded-md bg-muted/30 p-2">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        ) : (
          <Clock className="h-4 w-4 shrink-0 text-destructive" />
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{ok ? "Healthy" : "Needs attention"}</p>
          <p className="text-[10px] text-muted-foreground">{formatRelativeTime(row.last_tested_at)}</p>
        </div>
      </div>
    </div>
  );
}
