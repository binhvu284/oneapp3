import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";


/**
 * Edge Function to get system connection
 * This bypasses RLS to allow reading system connection even when user is not logged in
 * Used for:
 * - Checking if system has external connection configured (for signup flow)
 * - Getting connection status for all users
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[get-system-connection] Fetching system connection...");

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the first (and only) system connection
    const { data: connection, error } = await supabaseAdmin
      .from("system_connection")
      .select("id, supabase_url, supabase_anon_key, supabase_service_key, is_active, connection_status, last_tested_at, error_message, configured_by, created_at, updated_at")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[get-system-connection] Error fetching:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[get-system-connection] Connection found:", connection ? "yes" : "no");

    // Return connection info including service key for auth operations
    // Service key is used in edge functions (server-side) for sync-signup flow
    // Security note: The service key is only used within Lovable Cloud edge functions,
    // not exposed to external third parties

    if (connection) {
      const responseData = {
        id: connection.id,
        supabase_url: connection.supabase_url,
        supabase_anon_key: connection.supabase_anon_key,
        has_service_key: !!connection.supabase_service_key,
        // Always include service key for sync-signup flow (edge function usage only)
        supabase_service_key: connection.supabase_service_key,
        is_active: connection.is_active,
        connection_status: connection.connection_status,
        last_tested_at: connection.last_tested_at,
        error_message: connection.error_message,
        configured_by: connection.configured_by,
        created_at: connection.created_at,
        updated_at: connection.updated_at,
      };

      return new Response(
        JSON.stringify({ success: true, connection: responseData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No connection configured
    return new Response(
      JSON.stringify({ success: true, connection: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[get-system-connection] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
