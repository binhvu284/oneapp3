import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataQuery } from "@/lib/data-layer";
import { useLatestSystemConnection } from "@/hooks/useLatestSystemConnection";

export type PulseStatus = "ok" | "down" | "unknown";

const API_KEY_COLUMNS = [
  "chatgpt_key",
  "claude_key",
  "gemini_key",
  "deepseek_key",
  "grok_key",
  "groq_key",
  "perplexity_key",
] as const;

type ApiKeyRow = Record<(typeof API_KEY_COLUMNS)[number], string | null>;

/**
 * Phase 4 M6 — Sidebar 3.0 system pulse strip. Returns three status signals:
 *   - db: data source connection health (`system_connection`)
 *   - deploy: last system health check (proxy until a deploy log exists)
 *   - ai: whether any AI provider key is configured (`user_api_keys`)
 */
export function useSystemPulse(enabled: boolean) {
  const { user } = useAuthSafe();

  const sys = useLatestSystemConnection(enabled);

  const { data: keyData } = useDataQuery<ApiKeyRow>("user_api_keys", {
    queryOptions: {
      select: [...API_KEY_COLUMNS],
      filters: [{ column: "user_id", operator: "eq", value: user?.id ?? "" }],
      single: true,
    },
    enabled: enabled && !!user,
  });

  const keys = keyData?.data as ApiKeyRow | null;

  const db: PulseStatus = sys ? (sys.is_active ? "ok" : "down") : "unknown";
  const deploy: PulseStatus = sys ? (sys.connection_status === "error" ? "down" : "ok") : "unknown";
  const ai: PulseStatus = keys
    ? API_KEY_COLUMNS.some((c) => !!keys[c])
      ? "ok"
      : "down"
    : "unknown";

  return { db, deploy, ai };
}
