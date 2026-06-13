import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";

// Simple SQL safety check — blocks non-SELECT statements unless allow_mutations is true
function isSafeSelect(sql: string): boolean {
  const normalized = sql.trim().toLowerCase().replace(/\s+/g, " ");
  // Allow SELECT, WITH ... SELECT (CTEs), EXPLAIN
  return (
    normalized.startsWith("select ") ||
    normalized.startsWith("with ") ||
    normalized.startsWith("explain ")
  );
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { sql, allow_mutations } = body as { sql: string; allow_mutations?: boolean };

    if (!sql?.trim()) {
      return errResp("Missing SQL query", corsHeaders);
    }

    if (!allow_mutations && !isSafeSelect(sql)) {
      return errResp(
        "Only SELECT queries are allowed. Enable 'Allow mutations' to run INSERT/UPDATE/DELETE.",
        corsHeaders,
        403
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const startMs = Date.now();
    const { data, error } = await supabase.rpc("exec_sql_onecommand", { sql_query: sql });
    const latencyMs = Date.now() - startMs;

    if (error) {
      // Fall back to a plain query if the RPC isn't deployed yet
      // (returns an actionable error message for the UI)
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          hint: "The quick-query edge function requires the exec_sql_onecommand() helper to be installed in your database.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // data is expected to be a JSON array from the RPC
    const rows: Record<string, unknown>[] = Array.isArray(data) ? data : [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return new Response(
      JSON.stringify({ success: true, rows, columns, row_count: rows.length, latency_ms: latencyMs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[quick-query]", err);
    return errResp(err instanceof Error ? err.message : "Internal error", corsHeaders, 500);
  }
});

function errResp(msg: string, cors: Record<string, string>, status = 400) {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}
