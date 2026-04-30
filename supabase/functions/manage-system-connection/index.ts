import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";


interface ManageConnectionRequest {
  action: "save" | "test" | "disconnect" | "set-active";
  supabase_url?: string;
  supabase_anon_key?: string;
  supabase_service_key?: string;
  is_active?: boolean;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ManageConnectionRequest = await req.json();
    const { action, supabase_url, supabase_anon_key, supabase_service_key, is_active } = body;

    console.log(`[manage-system-connection] Action: ${action}`);

    // Get authenticated user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Also create a client with user token to get user info
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing system connection
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("system_connection")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("[manage-system-connection] Fetch error:", fetchError);
      throw fetchError;
    }

    switch (action) {
      case "save": {
        if (!supabase_url || !supabase_anon_key) {
          return new Response(
            JSON.stringify({ error: "supabase_url and supabase_anon_key are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const connectionData = {
          supabase_url,
          supabase_anon_key,
          supabase_service_key: supabase_service_key || null,
          connection_status: "disconnected",
          error_message: null,
          configured_by: user.id,
          updated_at: new Date().toISOString(),
        };

        if (existing) {
          // Update existing
          const { error } = await supabaseAdmin
            .from("system_connection")
            .update(connectionData)
            .eq("id", existing.id);

          if (error) throw error;
          console.log("[manage-system-connection] Updated existing connection");
        } else {
          // Create new
          const { error } = await supabaseAdmin
            .from("system_connection")
            .insert(connectionData);

          if (error) throw error;
          console.log("[manage-system-connection] Created new connection");
        }

        return new Response(
          JSON.stringify({ success: true, message: "Connection saved" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "test": {
        if (!existing?.supabase_url || !existing?.supabase_anon_key) {
          return new Response(
            JSON.stringify({ error: "No connection configured" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("[manage-system-connection] Testing connection to:", existing.supabase_url);

        try {
          // Test connection to external Supabase
          const testClient = createClient(
            existing.supabase_url,
            existing.supabase_service_key || existing.supabase_anon_key,
            { auth: { persistSession: false } }
          );

          // Try to query users table to verify connection
          const { error: testError } = await testClient
            .from("oneapp_users")
            .select("id")
            .limit(1);

          if (testError) {
            console.error("[manage-system-connection] Connection test failed:", testError);
            
            await supabaseAdmin
              .from("system_connection")
              .update({
                connection_status: "error",
                error_message: testError.message,
                last_tested_at: new Date().toISOString(),
              })
              .eq("id", existing.id);

            return new Response(
              JSON.stringify({ success: false, error: testError.message }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Connection successful
          await supabaseAdmin
            .from("system_connection")
            .update({
              connection_status: "connected",
              error_message: null,
              last_tested_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          console.log("[manage-system-connection] Connection test successful");

          return new Response(
            JSON.stringify({ success: true, message: "Connection test successful" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );

        } catch (error) {
          console.error("[manage-system-connection] Connection test error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          
          await supabaseAdmin
            .from("system_connection")
            .update({
              connection_status: "error",
              error_message: errorMessage,
              last_tested_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      case "disconnect": {
        if (!existing) {
          return new Response(
            JSON.stringify({ error: "No connection to disconnect" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin
          .from("system_connection")
          .update({
            supabase_url: null,
            supabase_anon_key: null,
            supabase_service_key: null,
            connection_status: "not_setup",
            is_active: false,
            error_message: null,
          })
          .eq("id", existing.id);

        if (error) throw error;

        console.log("[manage-system-connection] Connection disconnected");

        return new Response(
          JSON.stringify({ success: true, message: "Disconnected" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "set-active": {
        if (!existing) {
          return new Response(
            JSON.stringify({ error: "No connection configured" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin
          .from("system_connection")
          .update({ is_active: is_active ?? true })
          .eq("id", existing.id);

        if (error) throw error;

        console.log(`[manage-system-connection] Set active to ${is_active}`);

        return new Response(
          JSON.stringify({ success: true, message: `Set active to ${is_active}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error: unknown) {
    console.error("[manage-system-connection] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
