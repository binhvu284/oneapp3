import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { obscureApiKey } from "../_shared/encryption.ts";
import { getCorsHeaders, getJwtSecret } from "../_shared/config.ts";

async function getJwtKey() {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(getJwtSecret());
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// deno-lint-ignore no-explicit-any
type SupabaseClient = any;

/**
 * Save API key using INSERT-or-UPDATE pattern to avoid needing UNIQUE constraint.
 * Checks if row exists → UPDATE existing row, INSERT new row if not.
 */
async function saveApiKey(
  supabase: SupabaseClient,
  userId: string,
  keyColumn: string,
  apiKey: string,
  extraFields?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  // Check if row exists
  const { data: existing } = await supabase
    .from("user_api_keys")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const updateData: Record<string, string> = {
    [keyColumn]: apiKey,
    updated_at: new Date().toISOString(),
    ...extraFields,
  };

  if (existing) {
    // Row exists → UPDATE
    const { error } = await supabase
      .from("user_api_keys")
      .update(updateData)
      .eq("user_id", userId);

    if (error) {
      console.error(`[saveApiKey] UPDATE failed for ${keyColumn}:`, error);
      return { success: false, error: error.message };
    }
  } else {
    // No row yet → INSERT
    const { error } = await supabase
      .from("user_api_keys")
      .insert({ user_id: userId, ...updateData });

    if (error) {
      console.error(`[saveApiKey] INSERT failed for ${keyColumn}:`, error);
      return { success: false, error: error.message };
    }
  }

  console.info(`[saveApiKey] ${keyColumn} saved for user: ${userId}`);
  return { success: true };
}

// Input validation
const validateInput = (body: unknown): { valid: boolean; error?: string; data?: { provider: string; apiKey: string } } => {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.provider !== "string" || !["gemini", "chatgpt", "claude", "perplexity", "grok", "deepseek", "groq", "exa", "github"].includes(b.provider)) {
    return { valid: false, error: "Invalid provider" };
  }

  if (typeof b.apiKey !== "string" || b.apiKey.length < 10 || b.apiKey.length > 500) {
    return { valid: false, error: "Invalid API key format" };
  }

  return { valid: true, data: { provider: b.provider, apiKey: b.apiKey } };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract OneApp JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ valid: false, error: "Unauthorized. Please sign in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify OneApp JWT to get user ID
    let userId: string;
    try {
      const jwtKey = await getJwtKey();
      const payload = await verify(token, jwtKey) as Record<string, unknown>;
      userId = payload.sub as string;
      if (!userId) throw new Error("No user ID in token");
    } catch (err) {
      console.error("JWT verification failed:", err);
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service_role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    console.info(`Validating API key for user: ${userId}`);

    // Parse and validate input
    const body = await req.json();
    const validation = validateInput(body);

    if (!validation.valid || !validation.data) {
      return new Response(
        JSON.stringify({ valid: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { provider, apiKey } = validation.data;

    let isValid = false;
    let errorMessage = "";
    let modelVersion = "";

    if (provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hi" }] }],
            generationConfig: { maxOutputTokens: 1 }
          }),
        }
      );

      if (response.ok) {
        isValid = true;
        modelVersion = "Gemini 2.0 Flash";
        const saveResult = await saveApiKey(supabase, userId, "gemini_key", await obscureApiKey(apiKey));
        if (!saveResult.success) { isValid = false; errorMessage = `Validated OK but failed to save key: ${saveResult.error}`; }
      } else {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error?.message || "Failed to validate Gemini API key.";
      }
    }

    if (provider === "chatgpt") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: "Hi" }], max_tokens: 1 }),
      });

      if (response.ok) {
        isValid = true;
        modelVersion = "GPT-3.5 Turbo";
        const saveResult = await saveApiKey(supabase, userId, "chatgpt_key", await obscureApiKey(apiKey));
        if (!saveResult.success) { isValid = false; errorMessage = `Validated OK but failed to save key: ${saveResult.error}`; }
      } else {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error?.message || "Failed to validate ChatGPT API key.";
      }
    }

    if (provider === "claude") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 1, messages: [{ role: "user", content: "Hi" }] }),
      });

      if (response.ok) {
        isValid = true;
        modelVersion = "Claude 3 Haiku";
        const saveResult = await saveApiKey(supabase, userId, "claude_key", await obscureApiKey(apiKey));
        if (!saveResult.success) { isValid = false; errorMessage = `Validated OK but failed to save key: ${saveResult.error}`; }
      } else {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error?.message || "Failed to validate Claude API key.";
      }
    }

    if (provider === "perplexity") {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "sonar-small-chat", messages: [{ role: "user", content: "Hi" }], max_tokens: 1 }),
      });

      if (response.ok) {
        isValid = true;
        modelVersion = "Sonar Small Chat";
        const saveResult = await saveApiKey(supabase, userId, "perplexity_key", await obscureApiKey(apiKey));
        if (!saveResult.success) { isValid = false; errorMessage = `Validated OK but failed to save key: ${saveResult.error}`; }
      } else {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error?.message || "Failed to validate Perplexity API key.";
      }
    }

    if (provider === "grok") {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "grok-beta", messages: [{ role: "user", content: "Hi" }], max_tokens: 1 }),
      });

      if (response.ok) {
        isValid = true;
        modelVersion = "Grok Beta";
        const saveResult = await saveApiKey(supabase, userId, "grok_key", await obscureApiKey(apiKey));
        if (!saveResult.success) { isValid = false; errorMessage = `Validated OK but failed to save key: ${saveResult.error}`; }
      } else {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error?.message || "Failed to validate Grok API key.";
      }
    }

    if (provider === "deepseek") {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: "Hi" }], max_tokens: 1 }),
      });

      if (response.ok) {
        isValid = true;
        modelVersion = "DeepSeek Chat";
        const saveResult = await saveApiKey(supabase, userId, "deepseek_key", await obscureApiKey(apiKey));
        if (!saveResult.success) { isValid = false; errorMessage = `Validated OK but failed to save key: ${saveResult.error}`; }
      } else {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error?.message || "Failed to validate DeepSeek API key.";
      }
    }

    if (provider === "groq") {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama3-8b-8192", messages: [{ role: "user", content: "Hi" }], max_tokens: 1 }),
      });

      if (response.ok) {
        isValid = true;
        modelVersion = "LLaMA3-8b";
        const saveResult = await saveApiKey(supabase, userId, "groq_key", await obscureApiKey(apiKey));
        if (!saveResult.success) { isValid = false; errorMessage = `Validated OK but failed to save key: ${saveResult.error}`; }
      } else {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error?.message || "Failed to validate Groq API key.";
      }
    }

    if (provider === "exa") {
      const response = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ query: "test", numResults: 1 }),
      });

      if (response.ok) {
        isValid = true;
        modelVersion = "Exa Search";
        const saveResult = await saveApiKey(supabase, userId, "exa_key", await obscureApiKey(apiKey));
        if (!saveResult.success) { isValid = false; errorMessage = `Validated OK but failed to save key: ${saveResult.error}`; }
      } else {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error?.message || "Failed to validate Exa API key.";
      }
    }

    if (provider === "github") {
      const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5
        }),
      });

      if (response.ok) {
        const limitRemaining = response.headers.get("x-ratelimit-remaining-requests");
        const quotaInfo = limitRemaining ? ` (Quota: ${limitRemaining} reqs left)` : "";
        modelVersion = `GitHub API Validated${quotaInfo}`;

        const saveResult = await saveApiKey(supabase, userId, "github_key", await obscureApiKey(apiKey), {
          github_active_model: "gpt-4o",
        });

        if (saveResult.success) {
          isValid = true;
        } else {
          errorMessage = `Validated OK but failed to save key: ${saveResult.error}`;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error?.message || "Failed to validate GitHub Models PAT.";
      }
    }

    return new Response(
      JSON.stringify({ valid: isValid, error: errorMessage, modelVersion }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Validation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Validation failed";
    return new Response(
      JSON.stringify({ valid: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
