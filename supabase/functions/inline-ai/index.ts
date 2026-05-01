import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { getCorsHeaders, getJwtSecret } from "../_shared/config.ts";

type Action =
  | "continue"
  | "summarize"
  | "ideas"
  | "grammar"
  | "translate_en"
  | "translate_vi";

const SYSTEM_PROMPTS: Record<Action, string> = {
  continue:
    "You continue the user's writing in the same voice. Output 1-3 short paragraphs only — no preamble, no explanation.",
  summarize:
    "Summarize the section concisely as 2-4 bullet points capturing key facts and decisions only.",
  ideas:
    "Generate 5 distinct ideas related to the surrounding text. Output as a numbered list, one sentence each.",
  grammar:
    "Return the same text with grammar, punctuation, and clarity fixed. Preserve voice and meaning. Output the corrected text only — no commentary.",
  translate_en:
    "Translate the text to English. Output the translation only.",
  translate_vi:
    "Translate the text to Vietnamese. Output the translation only.",
};

interface RequestBody {
  action: Action;
  context: {
    above: string[];
    current: string;
    below: string[];
  };
}

function validate(body: unknown): { ok: true; data: RequestBody } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;
  if (typeof b.action !== "string" || !(b.action in SYSTEM_PROMPTS)) {
    return { ok: false, error: "Invalid action" };
  }
  const ctx = b.context as Record<string, unknown> | undefined;
  if (!ctx || typeof ctx.current !== "string") return { ok: false, error: "Missing context.current" };
  if (!Array.isArray(ctx.above) || !Array.isArray(ctx.below)) return { ok: false, error: "Bad context arrays" };
  return {
    ok: true,
    data: {
      action: b.action as Action,
      context: {
        above: ctx.above.slice(-3).map(String),
        current: String(ctx.current).slice(0, 4000),
        below: ctx.below.slice(0, 3).map(String),
      },
    },
  };
}

async function getJwtKey() {
  const keyData = new TextEncoder().encode(getJwtSecret());
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    let userId: string;
    try {
      const payload = await verify(token, await getJwtKey()) as Record<string, unknown>;
      userId = payload.sub as string;
      if (!userId) throw new Error("missing sub");
    } catch {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const v = validate(body);
    if (!v.ok) {
      return new Response(JSON.stringify({ error: v.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data: keyRow, error: keyErr } = await supabase
      .from("user_api_keys")
      .select("claude_key")
      .eq("user_id", userId)
      .single();

    if (keyErr || !keyRow?.claude_key) {
      return new Response(
        JSON.stringify({ error: "Missing Claude API key. Add one in AI settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, context } = v.data;
    const systemPrompt = SYSTEM_PROMPTS[action];
    const userMessage = [
      context.above.length > 0 ? `Earlier:\n${context.above.join("\n\n")}\n\n---` : "",
      `Current block:\n${context.current}`,
      context.below.length > 0 ? `\n---\nAfter:\n${context.below.join("\n\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": keyRow.claude_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        stream: true,
      }),
    });

    if (!anthropicResp.ok) {
      const text = await anthropicResp.text();
      return new Response(JSON.stringify({ error: `Anthropic error: ${text.slice(0, 200)}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(anthropicResp.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("inline-ai failed", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
