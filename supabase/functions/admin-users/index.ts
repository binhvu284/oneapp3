import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";


Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check if caller is admin (level 1)
    const { data: callerData } = await adminClient.from("oneapp_users").select("id, level").eq("lovable_user_id", user.id).single();
    if (!callerData || callerData.level !== 1) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET: List users by level
    if (req.method === "GET" && action === "list") {
      const level = parseInt(url.searchParams.get("level") || "0");
      const search = url.searchParams.get("search") || "";

      let query = adminClient.from("oneapp_users").select("*").order("created_at", { ascending: false });
      if (level > 0) query = query.eq("level", level);
      if (search) query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%,nickname.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) throw error;

      // Get roles for each user
      const userIds = (data || []).map((u: any) => u.id);
      const { data: roles } = await adminClient.from("user_roles").select("*").in("user_id", userIds);

      const usersWithRoles = (data || []).map((u: any) => ({
        ...u,
        roles: (roles || []).filter((r: any) => r.user_id === u.id),
      }));

      return new Response(JSON.stringify(usersWithRoles), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET: Count users by level
    if (req.method === "GET" && action === "counts") {
      const counts: Record<number, number> = {};
      for (const lvl of [1, 2, 3, 4]) {
        const { count } = await adminClient.from("oneapp_users").select("id", { count: "exact", head: true }).eq("level", lvl);
        counts[lvl] = count || 0;
      }
      return new Response(JSON.stringify(counts), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET: User sessions
    if (req.method === "GET" && action === "sessions") {
      const userId = url.searchParams.get("userId");
      const { data, error } = await adminClient.from("user_sessions").select("*").eq("user_id", userId!).order("last_used_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET: Permissions for a role
    if (req.method === "GET" && action === "permissions") {
      const role = url.searchParams.get("role");
      let query = adminClient.from("role_permissions").select("*");
      if (role) query = query.eq("role", role);
      const { data, error } = await query.order("permission");
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // POST actions
    if (req.method === "POST") {
      const body = await req.json();

      if (action === "delete-user") {
        const { userId } = body;
        // Check not deleting last admin
        const { data: targetUser } = await adminClient.from("oneapp_users").select("level").eq("id", userId).single();
        if (targetUser?.level === 1) {
          const { count } = await adminClient.from("oneapp_users").select("id", { count: "exact", head: true }).eq("level", 1);
          if ((count || 0) <= 1) {
            return new Response(JSON.stringify({ error: "Cannot delete the last admin" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }
        // Cascade delete
        await adminClient.from("user_sessions").delete().eq("user_id", userId);
        await adminClient.from("user_roles").delete().eq("user_id", userId);
        const { error } = await adminClient.from("oneapp_users").delete().eq("id", userId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "update-permissions") {
        const { role, permissions } = body; // permissions: string[]
        // Delete existing for role
        await adminClient.from("role_permissions").delete().eq("role", role);
        // Insert new
        if (permissions.length > 0) {
          const rows = permissions.map((p: string) => ({ role, permission: p }));
          const { error } = await adminClient.from("role_permissions").insert(rows);
          if (error) throw error;
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "revoke-session") {
        const { sessionId } = body;
        const { error } = await adminClient.from("user_sessions").delete().eq("id", sessionId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Partner keys management
      if (action === "create-partner-key") {
        const { key_code, description, max_uses, expires_at } = body;
        const { data, error } = await adminClient.from("partner_keys").insert({
          key_code, description, max_uses, expires_at, created_by: callerData.id,
        }).select().single();
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "toggle-partner-key") {
        const { keyId, is_active } = body;
        const { error } = await adminClient.from("partner_keys").update({ is_active }).eq("id", keyId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "add-verified-email") {
        const { email, expires_at } = body;
        const { data, error } = await adminClient.from("verified_emails").insert({
          email, expires_at, created_by: callerData.id,
        }).select().single();
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "delete-verified-email") {
        const { emailId } = body;
        const { error } = await adminClient.from("verified_emails").delete().eq("id", emailId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // List partner keys
      if (action === "list-partner-keys") {
        const { data, error } = await adminClient.from("partner_keys").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // List verified emails
      if (action === "list-verified-emails") {
        const { data, error } = await adminClient.from("verified_emails").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
