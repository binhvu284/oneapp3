const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

type EdgeFnAction = Record<string, unknown>;

async function callEdgeFunction(fn: string, payload: EdgeFnAction): Promise<Record<string, unknown>> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || json?.error) throw new Error(json?.error ?? `${fn} failed`);
  return json;
}

export async function githubProxy(userId: string, action: string, extra?: EdgeFnAction) {
  return callEdgeFunction("github-proxy", { user_id: userId, action, ...extra });
}

export async function vercelProxy(userId: string, action: string, extra?: EdgeFnAction) {
  return callEdgeFunction("vercel-proxy", { user_id: userId, action, ...extra });
}

export async function quickQuery(sql: string, allowMutations = false) {
  return callEdgeFunction("quick-query", { sql, allow_mutations: allowMutations });
}

/** Formats a Vercel deployment state into a UI label + color token. */
export function deploymentBadge(state: string): { label: string; color: string } {
  switch (state?.toUpperCase()) {
    case "READY":       return { label: "Ready",    color: "text-success" };
    case "BUILDING":    return { label: "Building",  color: "text-yellow-400" };
    case "QUEUED":      return { label: "Queued",    color: "text-muted-foreground" };
    case "ERROR":
    case "CANCELED":    return { label: state,       color: "text-destructive" };
    default:            return { label: state ?? "Unknown", color: "text-muted-foreground" };
  }
}

/** Formats a GitHub PR review state into a label. */
export function prStateBadge(state: string): { label: string; color: string } {
  switch (state?.toLowerCase()) {
    case "open":   return { label: "Open",   color: "text-success" };
    case "closed": return { label: "Closed", color: "text-muted-foreground" };
    case "merged": return { label: "Merged", color: "text-primary" };
    default:       return { label: state,    color: "text-muted-foreground" };
  }
}

/** Parses a command-palette prefix (e.g. "note: My title") into { prefix, rest }. */
export function parseCommandPrefix(input: string): { prefix: string; rest: string } | null {
  const match = input.match(/^(\w+):\s*(.*)$/);
  if (!match) return null;
  return { prefix: match[1].toLowerCase(), rest: match[2] };
}
