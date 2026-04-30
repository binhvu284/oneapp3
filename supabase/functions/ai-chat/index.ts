import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { getCorsHeaders, getJwtSecret } from "../_shared/config.ts";

const validateMessage = (msg: unknown): msg is { role: string; content: string } => {
  if (typeof msg !== "object" || msg === null) return false;
  const m = msg as Record<string, unknown>;
  if (typeof m.role !== "string" || typeof m.content !== "string") return false;
  if (!["user", "assistant", "system"].includes(m.role)) return false;
  if (m.content.length === 0 || m.content.length > 10000) return false;
  return true;
};

const validateRequest = (body: unknown): {
  valid: boolean;
  error?: string;
  data?: { messages: Array<{ role: string; content: string }>; provider: string; thinkHarder: boolean }
} => {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.provider !== "string" || !["gemini", "chatgpt", "claude", "perplexity", "grok", "deepseek", "groq", "exa", "github"].includes(b.provider)) {
    return { valid: false, error: "Invalid provider. Must be one of: gemini, chatgpt, claude, perplexity, grok, deepseek, groq, exa, github" };
  }

  if (!Array.isArray(b.messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  if (b.messages.length === 0 || b.messages.length > 50) {
    return { valid: false, error: "Messages array must have 1-50 items" };
  }

  for (const msg of b.messages) {
    if (!validateMessage(msg)) {
      return { valid: false, error: "Invalid message format. Each message must have role (user/assistant/system) and content (1-10000 chars)" };
    }
  }

  return {
    valid: true,
    data: {
      messages: b.messages as Array<{ role: string; content: string }>,
      provider: b.provider as string,
      thinkHarder: b.thinkHarder === true,
    }
  };
};

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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and verify OneApp JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in to use this feature." }),
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
        JSON.stringify({ error: "Invalid or expired session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service_role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const body = await req.json();
    const validation = validateRequest(body);

    if (!validation.valid || !validation.data) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, provider, thinkHarder } = validation.data;
    console.info(`Chat request: provider=${provider}, thinkHarder=${thinkHarder}, user=${userId}, msgs=${messages.length}`);

    let response: Response;
    let apiKey: string | undefined;
    let githubActiveModel: string = "gpt-4o";

    const { data: keyData, error: keyError } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: `No ${provider} API key found. Please configure it in AI settings.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (provider === "github") {
      apiKey = keyData.github_key;
      githubActiveModel = keyData.github_active_model || "gpt-4o";
    } else {
      apiKey = keyData[`${provider}_key`];
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `${provider} API key not configured. Please add it in AI settings.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (provider === "github") {
      response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: githubActiveModel,
          messages: [
            { role: "system", content: "You are a helpful AI assistant. Keep answers clear and concise. Use markdown formatting when appropriate. Respond in the same language as the user's message." },
            ...messages,
          ],
          stream: true,
        }),
      });
    } else if (provider === "gemini") {
      const geminiMessages = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      );
    } else if (provider === "chatgpt") {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful AI assistant. Keep answers clear and concise. Use markdown formatting when appropriate. Respond in the same language as the user's message." },
            ...messages,
          ],
          stream: true,
        }),
      });
    } else if (provider === "claude") {
      const anthropicMessages = messages.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      }));

      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 2048,
          messages: anthropicMessages,
          system: "You are a helpful AI assistant. Keep answers clear and concise. Use markdown formatting when appropriate. Respond in the same language as the user's message.",
          stream: true,
        }),
      });
    } else if (provider === "perplexity") {
      response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-small-chat",
          messages: [
            { role: "system", content: "You are a helpful AI assistant. Keep answers clear and concise. Use markdown formatting when appropriate. Respond in the same language as the user's message." },
            ...messages,
          ],
          stream: true,
        }),
      });
    } else if (provider === "grok") {
      response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            { role: "system", content: "You are a helpful AI assistant. Keep answers clear and concise. Use markdown formatting when appropriate. Respond in the same language as the user's message." },
            ...messages,
          ],
          stream: true,
        }),
      });
    } else if (provider === "deepseek") {
      response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a helpful AI assistant. Keep answers clear and concise. Use markdown formatting when appropriate. Respond in the same language as the user's message." },
            ...messages,
          ],
          stream: true,
        }),
      });
    } else if (provider === "groq") {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "You are a helpful AI assistant. Keep answers clear and concise. Use markdown formatting when appropriate. Respond in the same language as the user's message." },
            ...messages,
          ],
          stream: true,
        }),
      });
    } else if (provider === "exa") {
      // Exa is a search API, so we map the latest user message as the query.
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      response = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "x-api-key": apiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: lastUserMsg,
          numResults: 3,
          useAutoprompt: true,
        }),
      });

      // Exa doesn't stream chat format like others, we need to handle it separately
      // We will emulate an SSE response locally.
      if (response.ok) {
        const data = await response.json();
        let content = "Here are some top search results from Exa:\n\n";
        if (data.results && data.results.length > 0) {
          data.results.forEach((r: Record<string, any>, i: number) => {
            content += `${i + 1}. [${r.title || r.url}](${r.url})\n`;
          });
        } else {
          content = "I couldn't find any relevant results on Exa.";
        }

        const stream = new ReadableStream({
          start(controller) {
            const openaiFormat = { choices: [{ delta: { content } }] };
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openaiFormat)}\n\n`));
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
          }
        });

        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);

      if (response.status === 429) {
        const providerName = provider === "gemini" ? "Gemini" : provider === "chatgpt" ? "ChatGPT" : "Lovable AI";
        return new Response(
          JSON.stringify({ error: `${providerName} API quota exceeded. Please wait a moment or check your API plan.` }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your API key configuration." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For Gemini, transform the SSE format
    if (provider === "gemini") {
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const stream = new ReadableStream({
        async start(controller) {
          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  if (jsonStr === "[DONE]") {
                    controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                    continue;
                  }
                  try {
                    const data = JSON.parse(jsonStr);
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    if (text) {
                      const openaiFormat = { choices: [{ delta: { content: text } }] };
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openaiFormat)}\n\n`));
                    }
                  } catch (e) {
                    console.error("Error parsing Gemini response:", e);
                  }
                }
              }
            }
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
          } catch (e) {
            console.error("Stream error:", e);
            controller.error(e);
          }
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else if (provider === "claude") {
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const stream = new ReadableStream({
        async start(controller) {
          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("event: message_stop")) {
                  controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                  continue;
                }
                if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  try {
                    const data = JSON.parse(jsonStr);
                    if (data.type === "content_block_delta" && data.delta && data.delta.text) {
                      const text = data.delta.text;
                      const openaiFormat = { choices: [{ delta: { content: text } }] };
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openaiFormat)}\n\n`));
                    }
                  } catch {
                    // ignore
                  }
                }
              }
            }
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
