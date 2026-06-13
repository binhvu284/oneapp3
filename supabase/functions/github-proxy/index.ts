import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";

const GITHUB_API = "https://api.github.com";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, user_id, repo, pr_number, branch_name, base_branch } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Fetch the user's GitHub PAT
    const { data: keyRow, error: keyError } = await supabase
      .from("user_api_keys")
      .select("github_pat")
      .eq("user_id", user_id)
      .maybeSingle();

    if (keyError || !keyRow?.github_pat) {
      return new Response(JSON.stringify({ error: "GitHub PAT not configured" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pat = keyRow.github_pat;
    const ghHeaders = {
      Authorization: `Bearer ${pat}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "OneApp3-OneCommand",
    };

    async function ghFetch(path: string, options?: RequestInit) {
      const r = await fetch(`${GITHUB_API}${path}`, { ...options, headers: { ...ghHeaders, ...(options?.headers ?? {}) } });
      return r.json();
    }

    switch (action) {
      case "list-prs": {
        if (!repo) return errResp("Missing repo", corsHeaders);
        const data = await ghFetch(`/repos/${repo}/pulls?state=open&per_page=20`);
        return ok({ prs: data }, corsHeaders);
      }

      case "list-commits": {
        if (!repo) return errResp("Missing repo", corsHeaders);
        const data = await ghFetch(`/repos/${repo}/commits?per_page=10`);
        return ok({ commits: data }, corsHeaders);
      }

      case "list-check-runs": {
        if (!repo || !pr_number) return errResp("Missing repo or pr_number", corsHeaders);
        // Get the PR's head SHA first
        const pr = await ghFetch(`/repos/${repo}/pulls/${pr_number}`);
        const sha = pr?.head?.sha;
        if (!sha) return errResp("Could not resolve PR head SHA", corsHeaders);
        const checks = await ghFetch(`/repos/${repo}/commits/${sha}/check-runs`);
        return ok({ checks }, corsHeaders);
      }

      case "merge-pr": {
        if (!repo || !pr_number) return errResp("Missing repo or pr_number", corsHeaders);
        const data = await ghFetch(`/repos/${repo}/pulls/${pr_number}/merge`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ merge_method: "squash" }),
        });
        return ok({ result: data }, corsHeaders);
      }

      case "create-branch": {
        if (!repo || !branch_name) return errResp("Missing repo or branch_name", corsHeaders);
        const base = base_branch || "main";
        // Get base SHA
        const ref = await ghFetch(`/repos/${repo}/git/ref/heads/${base}`);
        const sha = ref?.object?.sha;
        if (!sha) return errResp("Could not resolve base branch SHA", corsHeaders);
        const data = await ghFetch(`/repos/${repo}/git/refs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref: `refs/heads/${branch_name}`, sha }),
        });
        return ok({ result: data }, corsHeaders);
      }

      case "get-repo-stats": {
        if (!repo) return errResp("Missing repo", corsHeaders);
        const [repoData, issues] = await Promise.all([
          ghFetch(`/repos/${repo}`),
          ghFetch(`/repos/${repo}/issues?state=open&per_page=1`),
        ]);
        return ok({ repo: repoData, open_issues: repoData?.open_issues_count ?? 0 }, corsHeaders);
      }

      default:
        return errResp(`Unknown action: ${action}`, corsHeaders, 400);
    }
  } catch (err) {
    console.error("[github-proxy]", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
