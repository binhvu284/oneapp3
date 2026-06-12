import { Sparkles, RefreshCw } from "lucide-react";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataQuery } from "@/lib/data-layer";
import { formatRelativeTime } from "@/lib/dashboard-metrics";

interface ConversationRow {
  title: string | null;
  updated_at: string;
}

/**
 * Phase 4 M5 — Canvas Dashboard 3.0. Today's AI briefing card; refreshable.
 * Reads the latest `conversations` row via the data-layer.
 */
export default function AIBriefingWidget() {
  const { user } = useAuthSafe();
  const { data, isFetching, refetch } = useDataQuery<ConversationRow>("conversations", {
    queryOptions: {
      select: ["title", "updated_at"],
      filters: [{ column: "user_id", operator: "eq", value: user?.id ?? "" }],
      order: [{ column: "updated_at", ascending: false }],
      limit: 1,
    },
    enabled: !!user,
  });

  const latest = (data?.data as ConversationRow[] | null)?.[0] ?? null;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Briefing
        </span>
        <button
          onClick={() => refetch()}
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
          aria-label="Refresh briefing"
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>
      {latest ? (
        <div className="flex-1 rounded-md bg-muted/30 p-2">
          <p className="line-clamp-2 text-xs text-foreground">{latest.title || "Untitled conversation"}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Last active {formatRelativeTime(latest.updated_at)}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-muted-foreground">No recent AI activity</p>
        </div>
      )}
    </div>
  );
}
