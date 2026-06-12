import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataQuery } from "@/lib/data-layer";
import { mergeActivity, type ActivityEvent } from "@/lib/dashboard-metrics";

interface NoteRow {
  title: string | null;
  updated_at: string;
}
interface TaskRow {
  content: string | null;
  updated_at: string;
  is_completed: boolean;
}
interface TxnRow {
  coin_symbol: string;
  transaction_type: string;
  created_at: string;
}

/**
 * Phase 4 M6 — Sidebar 3.0 mini activity feed. Aggregates the most recent
 * note edits, completed tasks, and crypto trades into a single most-recent-first
 * list (capped at 5). All reads go through the data-layer.
 */
export function useSidebarActivity(enabled: boolean) {
  const { user } = useAuthSafe();
  const on = enabled && !!user;
  const userFilter = [{ column: "user_id", operator: "eq" as const, value: user?.id ?? "" }];

  const { data: notesData } = useDataQuery<NoteRow>("notes", {
    queryOptions: {
      select: ["title", "updated_at"],
      filters: [...userFilter, { column: "is_archived", operator: "eq", value: false }],
      order: [{ column: "updated_at", ascending: false }],
      limit: 5,
    },
    enabled: on,
  });

  const { data: tasksData } = useDataQuery<TaskRow>("note_items", {
    queryOptions: {
      select: ["content", "updated_at", "is_completed"],
      filters: [...userFilter, { column: "is_completed", operator: "eq", value: true }],
      order: [{ column: "updated_at", ascending: false }],
      limit: 5,
    },
    enabled: on,
  });

  const { data: txnData } = useDataQuery<TxnRow>("crypto_transactions", {
    queryOptions: {
      select: ["coin_symbol", "transaction_type", "created_at"],
      filters: userFilter,
      order: [{ column: "created_at", ascending: false }],
      limit: 5,
    },
    enabled: on,
  });

  const noteRows = (notesData?.data as NoteRow[] | null) ?? [];
  const taskRows = (tasksData?.data as TaskRow[] | null) ?? [];
  const txnRows = (txnData?.data as TxnRow[] | null) ?? [];

  const events: ActivityEvent[] = [
    ...noteRows.map((n) => ({ kind: "note" as const, label: n.title || "Untitled note", at: n.updated_at })),
    ...taskRows.map((t) => ({ kind: "task" as const, label: t.content || "Task completed", at: t.updated_at })),
    ...txnRows.map((t) => ({
      kind: "crypto" as const,
      label: `${t.transaction_type === "sell" ? "Sold" : "Bought"} ${t.coin_symbol}`,
      at: t.created_at,
    })),
  ];

  return { events: mergeActivity(events, 5) };
}
