import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

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

const PROVIDER_KEY_MAP: Record<string, string> = {
    github: "github_key",
    gemini: "gemini_key",
    chatgpt: "chatgpt_key",
    claude: "claude_key",
    perplexity: "perplexity_key",
    grok: "grok_key",
    deepseek: "deepseek_key",
    groq: "groq_key",
    exa: "exa_key",
};

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const token = authHeader.replace("Bearer ", "");

        // Verify OneApp JWT
        let userId: string;
        try {
            const jwtKey = await getJwtKey();
            const payload = await verify(token, jwtKey) as Record<string, unknown>;
            userId = payload.sub as string;
            if (!userId) throw new Error("No user ID in token");
        } catch (err) {
            console.error("JWT verification failed:", err);
            return new Response(
                JSON.stringify({ error: "Invalid or expired session." }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const body = await req.json();
        const provider = body.provider as string;

        if (!provider || !PROVIDER_KEY_MAP[provider]) {
            return new Response(
                JSON.stringify({ error: "Invalid provider" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false }
        });

        const updateData: Record<string, null> = {
            [PROVIDER_KEY_MAP[provider]]: null,
        };
        if (provider === "github") {
            updateData.github_active_model = null;
        }

        const { error } = await supabase
            .from("user_api_keys")
            .update(updateData)
            .eq("user_id", userId);

        if (error) {
            console.error("Error disconnecting API key:", error);
            return new Response(
                JSON.stringify({ error: "Failed to disconnect API key" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("disconnect-api-key error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
