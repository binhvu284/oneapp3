import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";


interface ManageConnectionRequest {
  action: "disconnect" | "set-active" | "set-lovable-active";
  connectionId: string;
  active?: boolean;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ManageConnectionRequest = await req.json();
    const { action, connectionId, active } = body;

    console.log(`[manage-connection] Action: ${action}, connectionId: ${connectionId}`);

    if (!connectionId) {
      return new Response(
        JSON.stringify({ error: "connectionId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use internal Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (action) {
      case "disconnect": {
        console.log(`[manage-connection] Disconnecting connection: ${connectionId}`);
        
        const { error } = await supabaseAdmin
          .from("external_connections")
          .update({
            supabase_url: null,
            supabase_anon_key: null,
            supabase_service_key: null,
            connection_status: "not_setup",
            is_active: false,
            error_message: null,
          })
          .eq("id", connectionId);

        if (error) {
          console.error("[manage-connection] Disconnect error:", error);
          throw error;
        }

        console.log("[manage-connection] Disconnected successfully");
        
        return new Response(
          JSON.stringify({ success: true, message: "Disconnected successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "set-active": {
        console.log(`[manage-connection] Setting connection active: ${active}`);
        
        const { error } = await supabaseAdmin
          .from("external_connections")
          .update({ is_active: active ?? true })
          .eq("id", connectionId);

        if (error) {
          console.error("[manage-connection] Set active error:", error);
          throw error;
        }

        console.log(`[manage-connection] Set active to ${active} successfully`);
        
        return new Response(
          JSON.stringify({ success: true, message: `Set active to ${active}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "set-lovable-active": {
        console.log(`[manage-connection] Setting Lovable Cloud as active`);
        
        const { error } = await supabaseAdmin
          .from("external_connections")
          .update({ is_active: false })
          .eq("id", connectionId);

        if (error) {
          console.error("[manage-connection] Set Lovable active error:", error);
          throw error;
        }

        console.log("[manage-connection] Set Lovable Cloud as active successfully");
        
        return new Response(
          JSON.stringify({ success: true, message: "Lovable Cloud is now active" }),
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
    console.error("[manage-connection] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
