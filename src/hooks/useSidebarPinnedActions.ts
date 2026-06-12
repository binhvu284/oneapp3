import { useCallback } from "react";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataQuery, useDataUpsert } from "@/lib/data-layer";
import {
  parsePinnedIds,
  togglePinned,
  resolvePinnedActions,
} from "@/lib/sidebar-actions";

interface SettingsRow {
  sidebar_pinned_actions: unknown;
}

/**
 * Phase 4 M6 — Sidebar 3.0 pinnable quick-actions. Reads/writes
 * `user_settings.sidebar_pinned_actions` via the data-layer.
 */
export function useSidebarPinnedActions(enabled: boolean) {
  const { user } = useAuthSafe();
  const on = enabled && !!user;

  const { data } = useDataQuery<SettingsRow>("user_settings", {
    queryOptions: {
      select: ["sidebar_pinned_actions"],
      filters: [{ column: "user_id", operator: "eq", value: user?.id ?? "" }],
      single: true,
    },
    enabled: on,
  });

  const upsert = useDataUpsert<SettingsRow & { user_id: string }>("user_settings");

  const row = data?.data as SettingsRow | null;
  const ids = parsePinnedIds(row?.sidebar_pinned_actions);

  const togglePin = useCallback(
    (id: string) => {
      if (!user) return;
      const next = togglePinned(ids, id);
      upsert.mutate({
        data: { user_id: user.id, sidebar_pinned_actions: next },
        conflictColumns: ["user_id"],
      });
    },
    [user, ids, upsert],
  );

  return {
    pinned: resolvePinnedActions(ids),
    pinnedIds: ids,
    isPinned: (id: string) => ids.includes(id),
    togglePin,
  };
}
