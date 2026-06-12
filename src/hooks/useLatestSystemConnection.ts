import { useDataQuery } from "@/lib/data-layer";

export interface LatestSystemConnection {
  connection_status: string | null;
  is_active: boolean | null;
  last_tested_at: string | null;
  supabase_url: string | null;
}

/**
 * Phase 4 M5/M6 — shared read of the latest `system_connection` row via the
 * data-layer. A single stable query shape means DeployStatus, DBHealth, and the
 * sidebar pulse strip share one React Query cache entry (deduped to one fetch)
 * instead of issuing three.
 */
export function useLatestSystemConnection(enabled = true) {
  const { data } = useDataQuery<LatestSystemConnection>("system_connection", {
    queryOptions: {
      select: ["connection_status", "is_active", "last_tested_at", "supabase_url"],
      order: [{ column: "updated_at", ascending: false }],
      limit: 1,
    },
    enabled,
  });

  return (data?.data as LatestSystemConnection[] | null)?.[0] ?? null;
}
