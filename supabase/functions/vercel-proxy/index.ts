import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";

const VERCEL_API = "https://api.vercel.com";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, user_id, project_id, deployment_id, team_id } = body;

    if (!user_id) {
      return errResp("Missing user_id", corsHeaders);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data: keyRow, error: keyError } = await supabase
      .from("user_api_keys")
      .select("vercel_token")
      .eq("user_id", user_id)
      .maybeSingle();

    if (keyError || !keyRow?.vercel_token) {
      return errResp("Vercel token not configured", corsHeaders, 403);
    }

    const token = keyRow.vercel_token;
    const teamQuery = team_id ? `?teamId=${team_id}` : "";

    async function vFetch(path: string, options?: RequestInit) {
      const r = await fetch(`${VERCEL_API}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(options?.headers ?? {}),
        },
      });
      return r.json();
    }

    switch (action) {
      case "list-deployments": {
        if (!project_id) return errResp("Missing project_id", corsHeaders);
        const data = await vFetch(`/v6/deployments?projectId=${project_id}${teamQuery ? "&" + teamQuery.slice(1) : ""}&limit=5`);
        return ok({ deployments: data?.deployments ?? [] }, corsHeaders);
      }

      case "get-deployment": {
        if (!deployment_id) return errResp("Missing deployment_id", corsHeaders);
        const data = await vFetch(`/v13/deployments/${deployment_id}`);
        return ok({ deployment: data }, corsHeaders);
      }

      case "get-build-logs": {
        if (!deployment_id) return errResp("Missing deployment_id", corsHeaders);
        const data = await vFetch(`/v2/deployments/${deployment_id}/events`);
        return ok({ logs: data }, corsHeaders);
      }

      case "rollback": {
        if (!project_id || !deployment_id) return errResp("Missing project_id or deployment_id", corsHeaders);
        // Rollback by re-deploying a specific deployment
        const data = await vFetch(`/v13/deployments?${teamQuery.slice(1)}`, {
          method: "POST",
          body: JSON.stringify({ deploymentId: deployment_id }),
        });
        return ok({ result: data }, corsHeaders);
      }

      case "redeploy": {
        if (!deployment_id) return errResp("Missing deployment_id", corsHeaders);
        const data = await vFetch(`/v13/deployments?forceNew=1${team_id ? `&teamId=${team_id}` : ""}`, {
          method: "POST",
          body: JSON.stringify({ deploymentId: deployment_id }),
        });
        return ok({ result: data }, corsHeaders);
      }

      case "list-projects": {
        const data = await vFetch(`/v9/projects${teamQuery}`);
        return ok({ projects: data?.projects ?? [] }, corsHeaders);
      }

      default:
        return errResp(`Unknown action: ${action}`, corsHeaders, 400);
    }
  } catch (err) {
    console.error("[vercel-proxy]", err);
    return errResp(err instanceof Error ? err.message : "Internal error", corsHeaders, 500);
  }
});

function ok(data: unknown, cors: Record<string, string>) {
  return new Response(JSON.stringify({ success: true, ...data }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function errResp(msg: string, cors: Record<string, string>, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}
